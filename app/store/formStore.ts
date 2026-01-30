import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CustomerData, FootTrafficEntry } from '../types';

interface FormState {
  currentSlide: number;
  formData: CustomerData;
  allSubmissions: CustomerData[];
  isSubmitting: boolean;
  aiLoading: boolean;
  sessionStartTime: number | null;
  footTrafficEntries: FootTrafficEntry[];
  
  setCurrentSlide: (slide: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  updateFormData: (data: Partial<CustomerData>) => void;
  resetForm: () => void;
  addSubmission: (data: CustomerData) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setAiLoading: (loading: boolean) => void;
  clearAllSubmissions: () => void;
  startSession: () => void;
  getSessionDuration: () => number;
  
  // Foot Traffic Actions
  addFootTraffic: (count?: number, boothSection?: string, notes?: string) => void;
  incrementFootTraffic: (amount?: number) => void;
  clearFootTraffic: () => void;
  getTodayFootTraffic: () => number;
}

const initialFormData: CustomerData = {
  id: '',
  timestamp: '',
  boothSection: '',
  salesperson: '',
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
};

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
        formData: { ...initialFormData },
        sessionStartTime: null
      }),
      
      addSubmission: (data) => set((state) => ({
        allSubmissions: [...state.allSubmissions, data]
      })),
      
      setSubmitting: (isSubmitting) => set({ isSubmitting }),
      
      setAiLoading: (aiLoading) => set({ aiLoading }),
      
      clearAllSubmissions: () => set({ allSubmissions: [] }),
      
      startSession: () => set({ sessionStartTime: Date.now() }),
      
      getSessionDuration: () => {
        const startTime = get().sessionStartTime;
        if (!startTime) return 0;
        return Math.floor((Date.now() - startTime) / 1000);
      },
      
      // Foot Traffic Actions
      addFootTraffic: (count = 1, boothSection, notes) => set((state) => ({
        footTrafficEntries: [
          ...state.footTrafficEntries,
          {
            id: `ft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            count,
            boothSection,
            notes,
          },
        ],
      })),
      
      incrementFootTraffic: (amount = 1) => {
        const state = get();
        const now = new Date();
        const recentEntry = state.footTrafficEntries.find((entry) => {
          const entryTime = new Date(entry.timestamp);
          // Group entries within the same minute for batch counting
          return now.getTime() - entryTime.getTime() < 60000;
        });
        
        if (recentEntry) {
          // Update the most recent entry
          set({
            footTrafficEntries: state.footTrafficEntries.map((entry) =>
              entry.id === recentEntry.id
                ? { ...entry, count: entry.count + amount }
                : entry
            ),
          });
        } else {
          // Create a new entry
          set({
            footTrafficEntries: [
              ...state.footTrafficEntries,
              {
                id: `ft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: now.toISOString(),
                count: amount,
              },
            ],
          });
        }
      },
      
      clearFootTraffic: () => set({ footTrafficEntries: [] }),
      
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
        allSubmissions: state.allSubmissions,
        footTrafficEntries: state.footTrafficEntries,
      }),
    }
  )
);
