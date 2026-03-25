'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import FormWizard from './components/FormWizard';
import { useFormStore } from './store/formStore'; // <-- add
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Plus,
  Footprints
} from 'lucide-react';

const Dashboard = dynamic(() => import('./components/Dashboard'));
const AnalyticsDashboard = dynamic(() => import('./components/AnalyticsDashboard'));
const LeadList = dynamic(() => import('./components/LeadList'));
const FootTrafficCounter = dynamic(() => import('./components/FootTrafficCounter'));

type ViewType = 'form' | 'dashboard' | 'analytics' | 'leads' | 'traffic';

export default function Home() {
  const [view, setView] = useState<ViewType>('form');

  const handleViewChange = (newView: ViewType) => {
    if (newView === 'form') {
      // Ensure "New Entry" always starts at the Welcome slide
      const store = useFormStore.getState();
      store.resetForm();
      store.setCurrentSlide(0);
    }
    setView(newView);
  };

  return (
    <>
      {view === 'form' && (
        <FormWizard onViewDashboard={() => setView('dashboard')} />
      )}
      {view === 'dashboard' && (
        <DashboardWithNav 
          currentView={view}
          onViewChange={handleViewChange}
        />
      )}
      {view === 'analytics' && (
        <AnalyticsWithNav 
          currentView={view}
          onViewChange={handleViewChange}
        />
      )}
      {view === 'leads' && (
        <LeadsWithNav 
          currentView={view}
          onViewChange={handleViewChange}
        />
      )}
      {view === 'traffic' && (
        <TrafficWithNav 
          currentView={view}
          onViewChange={handleViewChange}
        />
      )}
    </>
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
  return (
    <nav 
      className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="h-14 sm:h-16 flex items-center">
          <div className="w-20 sm:w-auto sm:flex sm:items-center">
            <button
              onClick={() => onViewChange('dashboard')}
              className="hidden sm:flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1 -ml-1"
              aria-label="Go to dashboard home"
            >
              <span className="font-bold text-gray-800 text-sm md:text-base">Trade Shows Hub</span>
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center gap-2 sm:gap-2">
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

          <div className="flex items-center justify-end ml-2 sm:ml-3">
            <button
              onClick={() => onViewChange('form')}
              className="flex items-center justify-center gap-1 w-20 sm:min-w-[120px] px-2.5 py-2 sm:px-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium text-[11px] sm:text-sm hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Create new lead entry"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">New Entry</span>
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
      onClick={onClick}
      className={`px-2.5 py-1.5 sm:px-3 rounded-lg font-medium text-[11px] sm:text-sm transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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
      <Dashboard onBackToForm={() => onViewChange('form')} hideHeader />
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
      <AnalyticsDashboard onBack={() => onViewChange('dashboard')} hideHeader />
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
      <LeadList onBack={() => onViewChange('dashboard')} hideHeader />
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
      <FootTrafficCounter onBack={() => onViewChange('dashboard')} hideHeader />
    </div>
  );
}

