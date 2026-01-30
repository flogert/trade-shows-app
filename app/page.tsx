'use client';

import { useState } from 'react';
import Image from 'next/image';
import FormWizard from './components/FormWizard';
import Dashboard from './components/Dashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import CRMIntegration from './components/CRMIntegration';
import LeadList from './components/LeadList';
import FootTrafficCounter from './components/FootTrafficCounter';
import { useFormStore } from './store/formStore'; // <-- add
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Link2, 
  Plus,
  Footprints
} from 'lucide-react';

type ViewType = 'form' | 'dashboard' | 'analytics' | 'crm' | 'leads' | 'traffic';

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
      {view === 'crm' && (
        <CRMWithNav 
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
        <div className="flex items-center justify-between h-14 sm:h-16">
          <button
            onClick={() => onViewChange('dashboard')}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1 -ml-1"
            aria-label="Go to dashboard home"
          >
            <Image 
              src="/safagoods.png" 
              alt="Safagoods" 
              width={40} 
              height={40} 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <span className="font-bold text-gray-800 hidden sm:block text-sm md:text-base">Trade Show Hub</span>
          </button>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <NavButton 
              active={currentView === 'dashboard'} 
              onClick={() => onViewChange('dashboard')}
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Overview"
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
              label="Analytics"
            />
            <NavButton 
              active={currentView === 'traffic'} 
              onClick={() => onViewChange('traffic')}
              icon={<Footprints className="w-4 h-4" />}
              label="Traffic"
            />
            <NavButton 
              active={currentView === 'crm'} 
              onClick={() => onViewChange('crm')}
              icon={<Link2 className="w-4 h-4" />}
              label="CRM"
            />
            <div className="w-px h-6 sm:h-8 bg-gray-200 mx-1 sm:mx-2" aria-hidden="true" />
            <button
              onClick={() => onViewChange('form')}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium text-xs sm:text-sm hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
      className={`px-2 py-2 sm:px-3 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        active
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="hidden md:inline">{label}</span>
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

// CRM with Navigation
function CRMWithNav({ 
  currentView, 
  onViewChange 
}: { 
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}) {
  return (
    <div className="min-h-dvh bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50">
      <TopNav currentView={currentView} onViewChange={onViewChange} />
      <CRMIntegration onBack={() => onViewChange('dashboard')} hideHeader />
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

