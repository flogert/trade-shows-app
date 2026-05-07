'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';
import { mapFootTrafficRows, mapLeadRows, mapProfileRow, type FootTrafficRow, type LeadRow, type SalespersonProfileRow } from '../lib/database';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '../lib/supabase';
import { CustomerData, FootTrafficEntry, TEAM_MEMBERS, UserProfile } from '../types';

interface QueryError {
  message: string;
}

interface IdRow {
  id: string;
}

interface ProfilesTableApi {
  update: (values: Partial<SalespersonProfileRow>) => {
    eq: (column: string, value: string) => {
      select: (columns: string) => {
        maybeSingle: <TRow>() => Promise<{ data: TRow | null; error: QueryError | null }>;
      };
    };
  };
}

interface RecordsTableApi<TRow> {
  insert: (values: Omit<TRow, 'id' | 'created_at'>) => Promise<{ error: QueryError | null }>;
  select: (columns: 'id') => {
    returns: <TResult>() => Promise<{ data: TResult | null; error: QueryError | null }>;
  };
  delete: () => {
    in: (column: 'id', values: string[]) => Promise<{ error: QueryError | null }>;
  };
}

interface FormState {
  currentSlide: number;
  formData: CustomerData;
  allSubmissions: CustomerData[];
  isSubmitting: boolean;
  aiLoading: boolean;
  sessionStartTime: number | null;
  footTrafficEntries: FootTrafficEntry[];
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
  authMode: 'sign-in' | 'setup-password';
  currentUser: UserProfile | null;
  authError: string | null;
  authNotice: string | null;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  
  setCurrentSlide: (slide: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  updateFormData: (data: Partial<CustomerData>) => void;
  resetForm: () => void;
  addSubmission: (data: CustomerData) => Promise<void>;
  setSubmitting: (isSubmitting: boolean) => void;
  setAiLoading: (loading: boolean) => void;
  clearAllSubmissions: () => Promise<void>;
  startSession: () => void;
  getSessionDuration: () => number;
  hydrateFromSession: (session: Session | null) => Promise<void>;
  requestSignInLink: (email: string, salespersonId: string) => Promise<{ ok: boolean; error?: string }>;
  enterPasswordSetupMode: (email?: string | null) => void;
  signInWithPassword: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  completePasswordSetup: (password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  syncRemoteData: () => Promise<void>;
  
  // Foot Traffic Actions
  addFootTraffic: (count?: number, boothSection?: string, notes?: string) => Promise<void>;
  incrementFootTraffic: (amount?: number) => Promise<void>;
  clearFootTraffic: () => Promise<void>;
  getTodayFootTraffic: () => number;
}

const initialState = (salesperson = ''): CustomerData => ({
  id: '',
  timestamp: '',
  boothSection: '',
  salesperson,
  salespersonName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  businessName: '',
  businessType: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  selectedBrands: [],
  selectedCategories: [],
  preferredContact: '',
  bestTimeToContact: '',
  notes: '',
  placedOrder: false,
  orderNotes: '',
  aiInsights: '',
});

const initialFormData = initialState();

async function fetchProfileForSession(session: Session) {
  const supabase = getSupabaseBrowserClient();
  const email = session.user.email?.toLowerCase();

  if (!email) {
    throw new Error('Your account is missing an email address.');
  }

  const { data: profileRow, error: profileError } = await supabase
    .from('salesperson_profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle<SalespersonProfileRow>();

  if (profileError) {
    throw profileError;
  }

  if (!profileRow) {
    throw new Error('This email address is not authorized for the app.');
  }

  if (!profileRow.active) {
    throw new Error('This account has been disabled.');
  }

  if (!profileRow.auth_user_id) {
    const profilesTable = supabase.from('salesperson_profiles') as unknown as ProfilesTableApi;
    const { data: linkedRow, error: linkError } = await profilesTable
      .update({ auth_user_id: session.user.id })
      .eq('id', profileRow.id)
      .select('*')
      .maybeSingle<SalespersonProfileRow>();

    if (linkError) {
      throw linkError;
    }

    if (!linkedRow) {
      throw new Error('Unable to link the signed-in account to a salesperson profile.');
    }

    return mapProfileRow(linkedRow);
  }

  if (profileRow.auth_user_id !== session.user.id) {
    throw new Error('This email is already linked to a different account.');
  }

  return mapProfileRow(profileRow);
}

async function fetchRemoteRows(profile: UserProfile) {
  const supabase = getSupabaseBrowserClient();
  const isManager = profile.role === 'manager' || profile.role === 'admin';

  let leadsQuery = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  let trafficQuery = supabase
    .from('foot_traffic_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (!isManager) {
    leadsQuery = leadsQuery.eq('salesperson_profile_id', profile.id);
    trafficQuery = trafficQuery.eq('salesperson_profile_id', profile.id);
  }

  const [{ data: leadRows, error: leadsError }, { data: trafficRows, error: trafficError }] = await Promise.all([
    leadsQuery.returns<LeadRow[]>(),
    trafficQuery.returns<FootTrafficRow[]>(),
  ]);

  if (leadsError) {
    throw leadsError;
  }

  if (trafficError) {
    throw trafficError;
  }

  return {
    submissions: mapLeadRows(leadRows ?? []),
    traffic: mapFootTrafficRows(trafficRows ?? []),
  };
}

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
      currentSlide: 0,
      formData: { ...initialFormData },
      allSubmissions: [],
      isSubmitting: false,
      aiLoading: false,
      sessionStartTime: null,
      footTrafficEntries: [],
      authStatus: isSupabaseConfigured() ? 'loading' : 'unauthenticated',
      authMode: 'sign-in',
      currentUser: null,
      authError: isSupabaseConfigured() ? null : 'Missing Supabase environment variables. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      authNotice: null,
      isSyncing: false,
      lastSyncedAt: null,
      
      setCurrentSlide: (slide) => set({ currentSlide: slide }),
      
      nextSlide: () => set((state) => ({ currentSlide: state.currentSlide + 1 })),
      
      prevSlide: () => set((state) => ({ 
        currentSlide: Math.max(0, state.currentSlide - 1) 
      })),
      
      updateFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data }
      })),
      
      resetForm: () => set({ 
        currentSlide: 0, 
        formData: { ...initialState(get().currentUser?.salespersonId ?? '') },
        sessionStartTime: null
      }),

      addSubmission: async (data) => {
        const profile = get().currentUser;

        if (!profile) {
          throw new Error('You must be signed in to save leads.');
        }

        const submission = {
          ...data,
          salesperson: profile.salespersonId,
          salespersonName: profile.displayName,
        };

        const supabase = getSupabaseBrowserClient();
        const leadsTable = supabase.from('leads') as unknown as RecordsTableApi<LeadRow>;
        const { error } = await leadsTable.insert({
            salesperson_profile_id: profile.id,
            payload: submission,
          });

        if (error) {
          throw error;
        }

        set((state) => ({
          allSubmissions: [...state.allSubmissions, submission],
          formData: { ...state.formData, salesperson: profile.salespersonId, salespersonName: profile.displayName },
          lastSyncedAt: new Date().toISOString(),
        }));
      },
      
      setSubmitting: (isSubmitting) => set({ isSubmitting }),
      
      setAiLoading: (aiLoading) => set({ aiLoading }),
      
      clearAllSubmissions: async () => {
        const profile = get().currentUser;

        if (!profile || (profile.role !== 'manager' && profile.role !== 'admin')) {
          return;
        }

        const supabase = getSupabaseBrowserClient();
        const leadsTable = supabase.from('leads') as unknown as RecordsTableApi<LeadRow>;
        const { data: rows, error: selectError } = await leadsTable
          .select('id')
          .returns<IdRow[]>();

        if (selectError) {
          throw selectError;
        }

        const ids = ((rows ?? []) as Array<{ id: string }>).map((row) => row.id);

        if (ids.length > 0) {
          const { error } = await leadsTable.delete().in('id', ids);

          if (error) {
            throw error;
          }
        }

        set({ allSubmissions: [], lastSyncedAt: new Date().toISOString() });
      },
      
      startSession: () => set({ sessionStartTime: Date.now() }),
      
      getSessionDuration: () => {
        const startTime = get().sessionStartTime;
        if (!startTime) return 0;
        return Math.floor((Date.now() - startTime) / 1000);
      },

      hydrateFromSession: async (session) => {
        if (!isSupabaseConfigured()) {
          set({
            authStatus: 'unauthenticated',
            authMode: 'sign-in',
            currentUser: null,
            allSubmissions: [],
            footTrafficEntries: [],
            authError: 'Missing Supabase environment variables. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
            isSyncing: false,
          });
          return;
        }

        if (!session) {
          set({
            authStatus: 'unauthenticated',
            authMode: 'sign-in',
            currentUser: null,
            allSubmissions: [],
            footTrafficEntries: [],
            authError: null,
            authNotice: null,
            isSyncing: false,
            lastSyncedAt: null,
            formData: { ...initialState() },
          });
          return;
        }

        set({ authStatus: 'loading', authError: null, isSyncing: true });

        try {
          const profile = await fetchProfileForSession(session);
          const remoteRows = await fetchRemoteRows(profile);

          set({
            authStatus: 'authenticated',
            authMode: 'sign-in',
            currentUser: profile,
            allSubmissions: remoteRows.submissions,
            footTrafficEntries: remoteRows.traffic,
            authError: null,
            isSyncing: false,
            authNotice: null,
            lastSyncedAt: new Date().toISOString(),
            formData: {
              ...get().formData,
              salesperson: profile.salespersonId,
              salespersonName: profile.displayName,
            },
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to load your account.';

          set({
            authStatus: 'unauthenticated',
            authMode: 'sign-in',
            currentUser: null,
            allSubmissions: [],
            footTrafficEntries: [],
            authError: message,
            isSyncing: false,
            authNotice: null,
            lastSyncedAt: null,
            formData: { ...initialState() },
          });

          const supabase = getSupabaseBrowserClient();
          await supabase.auth.signOut();
        }
      },

      requestSignInLink: async (email, salespersonId) => {
        if (!isSupabaseConfigured()) {
          return {
            ok: false,
            error: 'Supabase is not configured yet.',
          };
        }

        const normalizedEmail = email.trim().toLowerCase();
        const selectedMember = TEAM_MEMBERS.find((member) => member.id === salespersonId);

        if (!selectedMember) {
          const error = 'Choose your name before requesting a sign-in link.';
          set({ authMode: 'sign-in', authNotice: null, authError: error, authStatus: 'unauthenticated' });
          return { ok: false, error };
        }

        if (selectedMember.email.toLowerCase() !== normalizedEmail) {
          const error = `The email for ${selectedMember.name} must be ${selectedMember.email}.`;
          set({ authMode: 'sign-in', authNotice: null, authError: error, authStatus: 'unauthenticated' });
          return { ok: false, error };
        }

        const supabase = getSupabaseBrowserClient();
        const redirectTo = typeof window === 'undefined' ? undefined : window.location.origin;
        const { error } = await supabase.auth.signInWithOtp({
          email: normalizedEmail,
          options: {
            emailRedirectTo: redirectTo,
            shouldCreateUser: true,
          },
        });

        if (error) {
          set({ authMode: 'sign-in', authNotice: null, authError: error.message, authStatus: 'unauthenticated' });
          return { ok: false, error: error.message };
        }

        set({
          authMode: 'sign-in',
          authError: null,
          authNotice: `Sign-in link sent to ${selectedMember.email}.`,
          authStatus: 'unauthenticated',
        });
        return { ok: true };
      },

      enterPasswordSetupMode: (email) => {
        set({
          authMode: 'setup-password',
          authStatus: 'unauthenticated',
          authError: null,
          authNotice: email ? `Create a password for ${email.toLowerCase()}.` : 'Create your password to finish account setup.',
        });
      },

      signInWithPassword: async (email, password) => {
        if (!isSupabaseConfigured()) {
          return {
            ok: false,
            error: 'Supabase is not configured yet.',
          };
        }

        const supabase = getSupabaseBrowserClient();
        const normalizedEmail = email.trim().toLowerCase();
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          set({ authMode: 'sign-in', authNotice: null, authError: error.message, authStatus: 'unauthenticated' });
          return { ok: false, error: error.message };
        }

        set({ authMode: 'sign-in', authNotice: `Signed in as ${normalizedEmail}.`, authError: null, authStatus: 'loading' });
        return { ok: true };
      },

      signUpWithPassword: async (email, password) => {
        if (!isSupabaseConfigured()) {
          return {
            ok: false,
            error: 'Supabase is not configured yet.',
          };
        }

        const supabase = getSupabaseBrowserClient();
        const normalizedEmail = email.trim().toLowerCase();
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        });

        if (error) {
          set({ authError: error.message, authNotice: null, authMode: 'sign-in' });
          return { ok: false, error: error.message };
        }

        if (!data.session) {
          set({
            authMode: 'sign-in',
            authError: 'Email confirmation is enabled in Supabase Auth. Disable email confirmation for direct self-setup, or pre-create the user in Supabase Auth.',
            authNotice: null,
            authStatus: 'unauthenticated',
          });
          return {
            ok: false,
            error: 'Email confirmation is enabled in Supabase Auth.',
          };
        }

        set({
          authMode: 'sign-in',
          authError: null,
          authNotice: `Account created for ${normalizedEmail}. Signing you in...`,
          authStatus: 'loading',
        });
        return { ok: true };
      },

      completePasswordSetup: async (password) => {
        if (!isSupabaseConfigured()) {
          return {
            ok: false,
            error: 'Supabase is not configured yet.',
          };
        }

        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
          set({ authError: error.message, authNotice: null, authMode: 'setup-password' });
          return { ok: false, error: error.message };
        }

        const { data } = await supabase.auth.getSession();
        set({ authError: null, authNotice: 'Password created. Signing you in...', authStatus: 'loading', authMode: 'sign-in' });
        await get().hydrateFromSession(data.session);
        return { ok: true };
      },

      signOut: async () => {
        if (!isSupabaseConfigured()) {
          set({
            authStatus: 'unauthenticated',
            authMode: 'sign-in',
            currentUser: null,
            allSubmissions: [],
            footTrafficEntries: [],
          });
          return;
        }

        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
        set({
          authStatus: 'unauthenticated',
          authMode: 'sign-in',
          currentUser: null,
          allSubmissions: [],
          footTrafficEntries: [],
          authError: null,
          authNotice: null,
          isSyncing: false,
          lastSyncedAt: null,
          formData: { ...initialState() },
        });
      },

      syncRemoteData: async () => {
        const profile = get().currentUser;

        if (!profile) {
          return;
        }

        set({ isSyncing: true, authError: null });

        try {
          const remoteRows = await fetchRemoteRows(profile);
          set({
            allSubmissions: remoteRows.submissions,
            footTrafficEntries: remoteRows.traffic,
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
          });
        } catch (error) {
          set({
            isSyncing: false,
            authError: error instanceof Error ? error.message : 'Unable to refresh data.',
          });
        }
      },
      
      // Foot Traffic Actions
      addFootTraffic: async (count = 1, boothSection, notes) => {
        const profile = get().currentUser;

        if (!profile) {
          throw new Error('You must be signed in to track foot traffic.');
        }

        const entry: FootTrafficEntry = {
          id: `ft-${crypto.randomUUID()}`,
          timestamp: new Date().toISOString(),
          count,
          boothSection,
          notes,
        };

        const supabase = getSupabaseBrowserClient();
        const trafficTable = supabase.from('foot_traffic_entries') as unknown as RecordsTableApi<FootTrafficRow>;
        const { error } = await trafficTable.insert({
            salesperson_profile_id: profile.id,
            payload: entry,
          });

        if (error) {
          throw error;
        }

        set((state) => ({
          footTrafficEntries: [...state.footTrafficEntries, entry],
          lastSyncedAt: new Date().toISOString(),
        }));
      },
      
      incrementFootTraffic: async (amount = 1) => {
        await get().addFootTraffic(amount);
      },
      
      clearFootTraffic: async () => {
        const profile = get().currentUser;

        if (!profile || (profile.role !== 'manager' && profile.role !== 'admin')) {
          return;
        }

        const supabase = getSupabaseBrowserClient();
        const trafficTable = supabase.from('foot_traffic_entries') as unknown as RecordsTableApi<FootTrafficRow>;
        const { data: rows, error: selectError } = await trafficTable
          .select('id')
          .returns<IdRow[]>();

        if (selectError) {
          throw selectError;
        }

        const ids = ((rows ?? []) as Array<{ id: string }>).map((row) => row.id);

        if (ids.length > 0) {
          const { error } = await trafficTable.delete().in('id', ids);

          if (error) {
            throw error;
          }
        }

        set({ footTrafficEntries: [], lastSyncedAt: new Date().toISOString() });
      },
      
      getTodayFootTraffic: () => {
        const state = get();
        const today = new Date().toDateString();
        return state.footTrafficEntries
          .filter((entry) => new Date(entry.timestamp).toDateString() === today)
          .reduce((sum, entry) => sum + entry.count, 0);
      },
    }),
    {
      name: 'trade-show-leads',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentSlide: state.currentSlide,
        formData: state.formData,
      }),
    }
  )
);
