'use client';

import { motion } from 'framer-motion';
import { startTransition, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Session } from '@supabase/supabase-js';
import AuthScreen from './components/AuthScreen';
import FormWizard from './components/FormWizard';
import { getSupabaseBrowserClient, isSupabaseConfigured } from './lib/supabase';
import { useFormStore } from './store/formStore';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Plus,
  Footprints,
  LogOut,
  Shield,
  RefreshCw,
} from 'lucide-react';

const Dashboard = dynamic(() => import('./components/Dashboard'), {
  loading: () => <ViewLoadingShell label="Loading dashboard" />,
});
const AnalyticsDashboard = dynamic(() => import('./components/AnalyticsDashboard'), {
  loading: () => <ViewLoadingShell label="Loading analytics" />,
});
const LeadList = dynamic(() => import('./components/LeadList'), {
  loading: () => <ViewLoadingShell label="Loading leads" />,
});
const FootTrafficCounter = dynamic(() => import('./components/FootTrafficCounter'), {
  loading: () => <ViewLoadingShell label="Loading traffic" />,
});

type ViewType = 'form' | 'dashboard' | 'analytics' | 'leads' | 'traffic';

export default function Home() {
  const [view, setView] = useState<ViewType>('form');
  const {
    authStatus,
    authMode,
    currentUser,
  } = useFormStore();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    const applySession = async (session: Session | null) => {
      await useFormStore.getState().hydrateFromSession(session);
    };

    void (async () => {
      const { data } = await supabase.auth.getSession();
      await applySession(data.session);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'PASSWORD_RECOVERY') {
        useFormStore.getState().enterPasswordSetupMode(session?.user.email ?? null);
        return;
      }

      void applySession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleViewChange = (newView: ViewType) => {
    if (newView === 'form') {
      const store = useFormStore.getState();
      store.resetForm();
      store.setCurrentSlide(0);
    }

    startTransition(() => {
      setView(newView);
    });
  };

  if (!isSupabaseConfigured()) {
    return <AuthScreen />;
  }

  if (authStatus === 'loading') {
    return (
      <div className="min-h-dvh bg-linear-to-br from-slate-950 via-indigo-950 to-fuchsia-900 px-4 py-10 text-white">
        <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-5xl items-center justify-center">
          <div className="grid w-full gap-5 rounded-4xl border border-white/10 bg-white/8 p-5 shadow-2xl backdrop-blur-xl md:grid-cols-[1.05fr_0.95fr] md:p-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
                <Shield className="h-4 w-4" />
                Secure booth access
              </div>
              <div className="space-y-2.5">
                <h1 className="text-3xl font-semibold leading-tight md:text-4xl">Checking your workspace.</h1>
                <p className="max-w-xl text-sm text-indigo-100/80 md:text-base">
                  Confirming your Supabase session and loading the latest leads and traffic data.
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0.88, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="rounded-[1.75rem] border border-white/12 bg-white/95 p-5 text-slate-900 shadow-xl md:p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg">
                <RefreshCw className="h-5 w-5 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold">Connecting to Supabase</h2>
              <p className="mt-1.5 text-sm text-slate-500">
                One moment while we confirm your session and prepare the booth dashboard.
              </p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-linear-to-r from-indigo-600 to-fuchsia-600"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.2, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (authMode === 'setup-password') {
    return <AuthScreen />;
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {view === 'form' && (
        <main id="main-content" tabIndex={-1}>
          <FormWizard onViewDashboard={() => handleViewChange('dashboard')} />
        </main>
      )}
      {view === 'dashboard' && (
        <DashboardWithNav currentView={view} onViewChange={handleViewChange} />
      )}
      {view === 'analytics' && (
        <AnalyticsWithNav currentView={view} onViewChange={handleViewChange} />
      )}
      {view === 'leads' && (
        <LeadsWithNav currentView={view} onViewChange={handleViewChange} />
      )}
      {view === 'traffic' && (
        <TrafficWithNav currentView={view} onViewChange={handleViewChange} />
      )}
    </>
  );
}

function ViewLoadingShell({ label }: { label: string }) {
  return (
    <div className="min-h-[40dvh] px-4 py-6" aria-live="polite" aria-busy="true">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <div className="mt-4 space-y-3">
          <div className="h-12 rounded-2xl bg-slate-200/80" />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="h-32 rounded-3xl bg-slate-200/70" />
            <div className="h-32 rounded-3xl bg-slate-200/70" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Shared Navigation Component
function TopNav({ 
  currentView, 
  onViewChange 
}: { 
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}) {
  const { currentUser, signOut, syncRemoteData, isSyncing, authError } = useFormStore();

  return (
    <nav 
      className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md"
      aria-label="Main navigation"
      aria-busy={isSyncing}
    >
      <div className="mx-auto max-w-7xl px-2.5 sm:px-4">
        <div className="flex min-h-14 items-center gap-2 py-2 sm:min-h-16 sm:gap-3">
          <div className="min-w-0 flex-1 sm:flex-none sm:items-center">
            <button
              type="button"
              onClick={() => onViewChange('dashboard')}
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-left transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Go to dashboard home"
            >
              <span className="truncate font-bold text-gray-800 text-sm md:text-base">Trade Shows Hub</span>
            </button>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:gap-2">
            <NavButton 
              active={currentView === 'dashboard'} 
              onClick={() => onViewChange('dashboard')}
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Home"
            />
            <NavButton 
              active={currentView === 'leads'} 
              onClick={() => onViewChange('leads')}
              icon={<Users className="w-4 h-4" />}
              label="Leads"
            />
            <NavButton 
              active={currentView === 'analytics'} 
              onClick={() => onViewChange('analytics')}
              icon={<BarChart3 className="w-4 h-4" />}
              label="Stats"
            />
            <NavButton 
              active={currentView === 'traffic'} 
              onClick={() => onViewChange('traffic')}
              icon={<Footprints className="w-4 h-4" />}
              label="Traffic"
            />
          </div>

          <div className="ml-1 flex items-center justify-end sm:ml-3">
            <div className="hidden lg:flex items-center gap-2 mr-3 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <Shield className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              <div className="leading-tight">
                <p className="text-xs font-semibold text-gray-800">{currentUser?.displayName}</p>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">{currentUser?.role}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void syncRemoteData()}
              className="hidden sm:flex items-center justify-center gap-1 mr-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Refresh online data"
              title={authError ?? 'Refresh online data'}
              aria-live="polite"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>Sync</span>
            </button>
            <button
              type="button"
              onClick={() => onViewChange('form')}
              className="flex min-h-11 items-center justify-center gap-1 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 px-3 py-2 text-[11px] font-medium text-white transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:min-w-30 sm:px-4 sm:text-sm"
              aria-label="Create new lead entry"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">New Entry</span>
              <span className="sm:hidden">New</span>
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="ml-2 flex min-h-11 items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:flex-row sm:gap-2 sm:px-3 sm:text-sm ${
        active
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// Dashboard with Navigation
function DashboardWithNav({ 
  currentView, 
  onViewChange 
}: { 
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}) {
  return (
    <div className="min-h-dvh bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50">
      <TopNav currentView={currentView} onViewChange={onViewChange} />
      <main id="main-content" tabIndex={-1}>
        <Dashboard onBackToForm={() => onViewChange('form')} hideHeader />
      </main>
    </div>
  );
}

// Analytics with Navigation
function AnalyticsWithNav({ 
  currentView, 
  onViewChange 
}: { 
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}) {
  return (
    <div className="min-h-dvh bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50">
      <TopNav currentView={currentView} onViewChange={onViewChange} />
      <main id="main-content" tabIndex={-1}>
        <AnalyticsDashboard onBack={() => onViewChange('dashboard')} hideHeader />
      </main>
    </div>
  );
}

// Leads with Navigation
function LeadsWithNav({ 
  currentView, 
  onViewChange 
}: { 
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}) {
  return (
    <div className="min-h-dvh bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50">
      <TopNav currentView={currentView} onViewChange={onViewChange} />
      <main id="main-content" tabIndex={-1}>
        <LeadList onBack={() => onViewChange('dashboard')} hideHeader />
      </main>
    </div>
  );
}

// Foot Traffic with Navigation
function TrafficWithNav({ 
  currentView, 
  onViewChange 
}: { 
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}) {
  return (
    <div className="min-h-dvh bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50">
      <TopNav currentView={currentView} onViewChange={onViewChange} />
      <main id="main-content" tabIndex={-1}>
        <FootTrafficCounter onBack={() => onViewChange('dashboard')} hideHeader />
      </main>
    </div>
  );
}

