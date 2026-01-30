'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormStore } from '../store/formStore';
import { CustomerData, BRANDS, BOOTH_SECTIONS, CATEGORIES, SALESPEOPLE } from '../types';
import {
  calculateLeadScore,
  segmentLeads,
  getLeadPriorityActions,
  LeadScoreBreakdown,
} from '../utils/leadScoring';
import { exportToExcel } from '../utils/export';
import {
  ArrowLeft,
  Download,
  Search,
  Flame,
  Thermometer,
  Snowflake,
  List,
  LayoutGrid,
  User,
  Mail,
  Phone,
  Building,
  Tag,
  X,
  ChevronRight,
  TrendingUp,
  Clock,
  Target,
  Inbox,
} from 'lucide-react';

interface LeadListProps {
  onBack: () => void;
  hideHeader?: boolean;
}

type FilterType = 'all' | 'hot' | 'warm' | 'cold' | 'A' | 'B' | 'C' | 'D';
type SortType = 'score' | 'name' | 'date' | 'business';

export default function LeadList({ onBack, hideHeader = false }: LeadListProps) {
  const { allSubmissions } = useFormStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('score');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedLead, setSelectedLead] = useState<CustomerData | null>(null);
  const [selectedLeadScore, setSelectedLeadScore] = useState<LeadScoreBreakdown | null>(null);

  const segmented = useMemo(() => segmentLeads(allSubmissions), [allSubmissions]);

  const filteredAndSortedLeads = useMemo(() => {
    let leads = [...allSubmissions];

    // Apply filter
    if (filter === 'hot') leads = segmented.hot;
    else if (filter === 'warm') leads = segmented.warm;
    else if (filter === 'cold') leads = segmented.cold;
    else if (['A', 'B', 'C', 'D'].includes(filter)) {
      leads = segmented.byGrade[filter];
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      leads = leads.filter(
        (lead) =>
          lead.firstName.toLowerCase().includes(query) ||
          lead.lastName.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.businessName?.toLowerCase().includes(query)
      );
    }

    // Apply sort
    leads.sort((a, b) => {
      switch (sort) {
        case 'score':
          return calculateLeadScore(b).total - calculateLeadScore(a).total;
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'date':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'business':
          return (a.businessName || '').localeCompare(b.businessName || '');
        default:
          return 0;
      }
    });

    return leads;
  }, [allSubmissions, filter, sort, searchQuery, segmented]);

  const handleLeadClick = (lead: CustomerData) => {
    setSelectedLead(lead);
    setSelectedLeadScore(calculateLeadScore(lead));
  };

  const handleExport = () => {
    const leadsWithScores = filteredAndSortedLeads.map((lead) => {
      const score = calculateLeadScore(lead);
      return {
        ...lead,
        leadScore: score.total,
        leadGrade: score.grade,
        engagementLevel: score.engagementLevel,
      };
    });
    exportToExcel(leadsWithScores, 'qualified-leads');
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500 text-white';
      case 'B': return 'bg-blue-500 text-white';
      case 'C': return 'bg-amber-500 text-white';
      case 'D': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getEngagementIcon = (level: string) => {
    switch (level) {
      case 'hot': return <Flame className="w-4 h-4 text-red-400" />;
      case 'warm': return <Thermometer className="w-4 h-4 text-amber-400" />;
      case 'cold': return <Snowflake className="w-4 h-4 text-blue-400" />;
      default: return null;
    }
  };

  const containerClassName = hideHeader
    ? 'min-h-dvh bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50 p-3 sm:p-4 md:p-6 embed-light'
    : 'min-h-dvh bg-linear-to-br from-slate-900 via-indigo-950 to-purple-950 p-3 sm:p-4 md:p-6';

  const getSalespersonName = (id?: string) =>
    SALESPEOPLE.find((s) => s.id === id)?.name || id || '';

  const getBoothSectionName = (id?: string) =>
    BOOTH_SECTIONS.find((s) => s.id === id)?.name || id || '';

  return (
    <div className={containerClassName}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {!hideHeader && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Go back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Lead List</h1>
                <p className="text-indigo-300 text-xs sm:text-sm">Scored & segmented leads</p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-xl bg-linear-to-r from-green-500 to-emerald-500 text-white font-medium shadow-md hover:shadow-lg transition-all text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label={`Export ${filteredAndSortedLeads.length} filtered leads`}
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Export</span> ({filteredAndSortedLeads.length})
            </button>
          </motion.div>
        )}

        {/* Segmentation Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6"
          role="group"
          aria-label="Filter leads by temperature"
        >
          <button
            onClick={() => setFilter(filter === 'hot' ? 'all' : 'hot')}
            className={`p-3 sm:p-4 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-red-500 ${
              filter === 'hot'
                ? 'bg-red-500/20 border-red-500'
                : 'bg-white/5 border-white/10 hover:border-red-500/50'
            }`}
            aria-pressed={filter === 'hot'}
          >
            <div className="flex items-center justify-between">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" aria-hidden="true" />
              <span className="text-xl sm:text-2xl font-bold text-red-400">{segmented.hot.length}</span>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm mt-1 sm:mt-2">Hot Leads</p>
          </button>
          <button
            onClick={() => setFilter(filter === 'warm' ? 'all' : 'warm')}
            className={`p-3 sm:p-4 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              filter === 'warm'
                ? 'bg-amber-500/20 border-amber-500'
                : 'bg-white/5 border-white/10 hover:border-amber-500/50'
            }`}
            aria-pressed={filter === 'warm'}
          >
            <div className="flex items-center justify-between">
              <Thermometer className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" aria-hidden="true" />
              <span className="text-xl sm:text-2xl font-bold text-amber-400">{segmented.warm.length}</span>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm mt-1 sm:mt-2">Warm Leads</p>
          </button>
          <button
            onClick={() => setFilter(filter === 'cold' ? 'all' : 'cold')}
            className={`p-3 sm:p-4 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              filter === 'cold'
                ? 'bg-blue-500/20 border-blue-500'
                : 'bg-white/5 border-white/10 hover:border-blue-500/50'
            }`}
            aria-pressed={filter === 'cold'}
          >
            <div className="flex items-center justify-between">
              <Snowflake className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" aria-hidden="true" />
              <span className="text-xl sm:text-2xl font-bold text-blue-400">{segmented.cold.length}</span>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm mt-1 sm:mt-2">Cold Leads</p>
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`p-3 sm:p-4 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              filter === 'all'
                ? 'bg-indigo-500/20 border-indigo-500'
                : 'bg-white/5 border-white/10 hover:border-indigo-500/50'
            }`}
            aria-pressed={filter === 'all'}
          >
            <div className="flex items-center justify-between">
              <List className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" aria-hidden="true" />
              <span className="text-xl sm:text-2xl font-bold text-indigo-400">{allSubmissions.length}</span>
            </div>
            <p className="text-gray-300 text-sm mt-2">All Leads</p>
          </button>
        </motion.div>

        {/* Grade Filter Pills */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          <span className="text-gray-400 text-sm self-center mr-2">Filter by grade:</span>
          {(['A', 'B', 'C', 'D'] as const).map((grade) => (
            <button
              key={grade}
              onClick={() => setFilter(filter === grade ? 'all' : grade)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === grade
                  ? getGradeColor(grade)
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Grade {grade} ({segmented.byGrade[grade].length})
            </button>
          ))}
        </motion.div>

        {/* Search, Sort and View Toggle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-3 pl-10 rounded-xl border focus:border-indigo-500 focus:outline-none ${
                hideHeader 
                  ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
              }`}
              aria-label="Search leads"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
          </div>
          <div className="flex gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className={`px-4 py-3 rounded-xl border focus:border-indigo-500 focus:outline-none ${
                hideHeader
                  ? 'bg-white border-gray-300 text-gray-900'
                  : 'bg-white/5 border-white/10 text-white'
              }`}
            >
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
              <option value="business">Sort by Business</option>
            </select>
            <div className={`flex rounded-xl overflow-hidden border ${
              hideHeader ? 'border-gray-300' : 'border-white/10'
            }`}>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 flex items-center justify-center transition-colors ${
                  viewMode === 'list'
                    ? 'bg-indigo-500 text-white'
                    : hideHeader
                      ? 'bg-white text-gray-600 hover:bg-gray-100'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 flex items-center justify-center transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-indigo-500 text-white'
                    : hideHeader
                      ? 'bg-white text-gray-600 hover:bg-gray-100'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Lead Cards - List or Grid View */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "flex flex-col gap-3"
          }
        >
          {filteredAndSortedLeads.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Inbox className="w-12 h-12 text-gray-500 mx-auto mb-4" aria-hidden="true" />
              <p className={hideHeader ? 'text-gray-600' : 'text-gray-400'}>No leads match your criteria</p>
            </div>
          ) : viewMode === 'list' ? (
            // List View
            filteredAndSortedLeads.map((lead, index) => {
              const score = calculateLeadScore(lead);
              return (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => handleLeadClick(lead)}
                  className={`rounded-xl p-4 border cursor-pointer transition-all ${
                    hideHeader
                      ? 'bg-white border-gray-200 hover:border-indigo-400 hover:bg-gray-50 shadow-sm'
                      : 'bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                      {lead.firstName.charAt(0)}
                    </div>
                    
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium truncate ${hideHeader ? 'text-gray-900' : 'text-white'}`}>{lead.firstName} {lead.lastName}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 ${getGradeColor(score.grade)}`}>
                          {score.grade}
                        </span>
                        <span className="shrink-0">{getEngagementIcon(score.engagementLevel)}</span>
                      </div>
                      <div className={`flex items-center gap-3 text-sm ${hideHeader ? 'text-gray-500' : 'text-gray-400'}`}>
                        <span className="truncate">{lead.businessName || 'Individual'}</span>
                        <span className={hideHeader ? 'text-gray-300' : 'text-gray-600'}>•</span>
                        <span className="capitalize">{lead.businessType || 'N/A'}</span>
                        {lead.salesperson && (
                          <>
                            <span className={hideHeader ? 'text-gray-300' : 'text-gray-600'}>•</span>
                            <span className="truncate">{getSalespersonName(lead.salesperson)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="hidden sm:block w-32 shrink-0">
                      <div className={`flex justify-between text-xs mb-1 ${hideHeader ? 'text-gray-500' : 'text-gray-400'}`}>
                        <span>Score</span>
                        <span className={`font-medium ${hideHeader ? 'text-gray-900' : 'text-white'}`}>{score.total}</span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${hideHeader ? 'bg-gray-200' : 'bg-white/10'}`}>
                        <div
                          className={`h-full rounded-full ${
                            score.total >= 70 ? 'bg-green-500' :
                            score.total >= 45 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${score.total}%` }}
                        />
                      </div>
                    </div>

                    {/* Brands */}
                    <div className="hidden md:flex flex-wrap gap-1 w-40 shrink-0">
                      {lead.selectedBrands.slice(0, 2).map((brandId) => {
                        const brand = BRANDS.find((b) => b.id === brandId);
                        return brand ? (
                          <span
                            key={brandId}
                            className="px-2 py-0.5 rounded text-xs text-white"
                            style={{ backgroundColor: brand.color }}
                          >
                            {brand.name}
                          </span>
                        ) : null;
                      })}
                      {lead.selectedBrands.length > 2 && (
                        <span className={`px-2 py-0.5 rounded text-xs ${hideHeader ? 'bg-gray-200 text-gray-600' : 'bg-white/20 text-gray-300'}`}>
                          +{lead.selectedBrands.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <div className={`hidden lg:block text-xs w-24 text-right shrink-0 ${hideHeader ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(lead.timestamp).toLocaleDateString()}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className={`w-5 h-5 shrink-0 ${hideHeader ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                </motion.div>
              );
            })
          ) : (
            // Grid View
            filteredAndSortedLeads.map((lead, index) => {
              const score = calculateLeadScore(lead);
              return (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleLeadClick(lead)}
                  className={`rounded-xl p-4 border cursor-pointer transition-all ${
                    hideHeader
                      ? 'bg-white border-gray-200 hover:border-indigo-400 hover:bg-gray-50 shadow-sm'
                      : 'bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {lead.firstName.charAt(0)}
                      </div>
                      <div>
                        <h4 className={`font-medium ${hideHeader ? 'text-gray-900' : 'text-white'}`}>{lead.firstName} {lead.lastName}</h4>
                        <p className={`text-sm ${hideHeader ? 'text-gray-500' : 'text-gray-400'}`}>{lead.businessName || 'Individual'}</p>
                        {(lead.salesperson || lead.boothSection) && (
                          <p className={`text-xs ${hideHeader ? 'text-gray-400' : 'text-gray-500'}`}>
                            {getSalespersonName(lead.salesperson)}
                            {lead.salesperson && lead.boothSection ? ' • ' : ''}
                            {getBoothSectionName(lead.boothSection)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getEngagementIcon(score.engagementLevel)}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(score.grade)}`}>
                        {score.grade}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className={`flex justify-between text-xs mb-1 ${hideHeader ? 'text-gray-500' : 'text-gray-400'}`}>
                      <span>Lead Score</span>
                      <span className={`font-medium ${hideHeader ? 'text-gray-900' : 'text-white'}`}>{score.total}/100</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${hideHeader ? 'bg-gray-200' : 'bg-white/10'}`}>
                      <div
                        className={`h-full rounded-full ${
                          score.total >= 70 ? 'bg-green-500' :
                          score.total >= 45 ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${score.total}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {lead.selectedBrands.slice(0, 3).map((brandId) => {
                      const brand = BRANDS.find((b) => b.id === brandId);
                      return brand ? (
                        <span
                          key={brandId}
                          className="px-2 py-0.5 rounded text-xs text-white"
                          style={{ backgroundColor: brand.color }}
                        >
                          {brand.name}
                        </span>
                      ) : null;
                    })}
                    {lead.selectedBrands.length > 3 && (
                      <span className={`px-2 py-0.5 rounded text-xs ${hideHeader ? 'bg-gray-200 text-gray-600' : 'bg-white/20 text-gray-300'}`}>
                        +{lead.selectedBrands.length - 3}
                      </span>
                    )}
                  </div>

                  <div className={`flex items-center justify-between text-xs ${hideHeader ? 'text-gray-500' : 'text-gray-400'}`}>
                    <span className="capitalize">{lead.businessType || 'Not specified'}</span>
                    <span>{new Date(lead.timestamp).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Lead Detail Modal */}
        <AnimatePresence>
          {selectedLead && selectedLeadScore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
                hideHeader ? 'bg-black/40 backdrop-blur-sm' : 'bg-black/70 backdrop-blur-sm'
              }`}
              onClick={() => {
                setSelectedLead(null);
                setSelectedLeadScore(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden ${
                  hideHeader
                    ? 'bg-white border border-gray-200'
                    : 'bg-slate-900 border border-white/10'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header - Fixed */}
                <div className={`p-6 border-b shrink-0 ${hideHeader ? 'border-gray-200' : 'border-white/10'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                        {selectedLead.firstName.charAt(0)}
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${hideHeader ? 'text-gray-900' : 'text-white'}`}>
                          {selectedLead.firstName} {selectedLead.lastName}
                        </h3>
                        <p className={hideHeader ? 'text-gray-600' : 'text-gray-400'}>{selectedLead.businessName || 'Individual'}</p>
                        <p className={`text-sm ${hideHeader ? 'text-gray-500' : 'text-gray-500'}`}>{selectedLead.email}</p>
                        {(selectedLead.salesperson || selectedLead.boothSection) && (
                          <p className={`text-sm ${hideHeader ? 'text-gray-500' : 'text-gray-500'}`}>
                            {getSalespersonName(selectedLead.salesperson)}
                            {selectedLead.salesperson && selectedLead.boothSection ? ' • ' : ''}
                            {getBoothSectionName(selectedLead.boothSection)}
                          </p>
                        )}
                        {selectedLead.dwellTime && selectedLead.dwellTime > 0 && (
                          <p className={`text-sm flex items-center gap-1 ${hideHeader ? 'text-gray-500' : 'text-gray-500'}`}>
                            <Clock className="w-3 h-3" />
                            {Math.floor(selectedLead.dwellTime / 60)}m {selectedLead.dwellTime % 60}s at booth
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedLead(null);
                        setSelectedLeadScore(null);
                      }}
                      className={`p-1 rounded-lg transition-colors ${
                        hideHeader
                          ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 min-h-0">
                {/* Score Breakdown */}
                <div className={`p-6 border-b ${hideHeader ? 'border-gray-200' : 'border-white/10'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-semibold ${hideHeader ? 'text-gray-900' : 'text-white'}`}>Lead Score Breakdown</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getEngagementIcon(selectedLeadScore.engagementLevel)}</span>
                      <span className={`px-3 py-1 rounded-lg text-lg font-bold ${getGradeColor(selectedLeadScore.grade)}`}>
                        Grade {selectedLeadScore.grade}
                      </span>
                      <span className={`text-2xl font-bold ${hideHeader ? 'text-gray-900' : 'text-white'}`}>{selectedLeadScore.total}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedLeadScore.factors.map((factor) => (
                      <div key={factor.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={hideHeader ? 'text-gray-600' : 'text-gray-300'}>{factor.name}</span>
                          <span className={hideHeader ? 'text-gray-900' : 'text-white'}>{factor.points}/{factor.maxPoints}</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${hideHeader ? 'bg-gray-200' : 'bg-white/10'}`}>
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(factor.points / factor.maxPoints) * 100}%` }}
                          />
                        </div>
                        <p className={`text-xs mt-1 ${hideHeader ? 'text-gray-500' : 'text-gray-500'}`}>{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className={`p-6 border-b ${hideHeader ? 'border-gray-200' : 'border-white/10'}`}>
                  <h4 className={`font-semibold mb-3 ${hideHeader ? 'text-gray-900' : 'text-white'}`}>Contact Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className={hideHeader ? 'text-gray-500' : 'text-gray-500'}>Phone</p>
                      <p className={hideHeader ? 'text-gray-900' : 'text-white'}>{selectedLead.phone}</p>
                    </div>
                    <div>
                      <p className={hideHeader ? 'text-gray-500' : 'text-gray-500'}>Preferred Contact</p>
                      <p className={`capitalize ${hideHeader ? 'text-gray-900' : 'text-white'}`}>{selectedLead.preferredContact}</p>
                    </div>
                    <div>
                      <p className={hideHeader ? 'text-gray-500' : 'text-gray-500'}>Best Time</p>
                      <p className={hideHeader ? 'text-gray-900' : 'text-white'}>{selectedLead.bestTimeToContact || 'Any'}</p>
                    </div>
                    <div>
                      <p className={hideHeader ? 'text-gray-500' : 'text-gray-500'}>Business Type</p>
                      <p className={`capitalize ${hideHeader ? 'text-gray-900' : 'text-white'}`}>{selectedLead.businessType}</p>
                    </div>
                  </div>
                </div>

                {/* Interests */}
                <div className="p-6">
                  <h4 className={`font-semibold mb-3 ${hideHeader ? 'text-gray-900' : 'text-white'}`}>Interests</h4>
                  <div className="mb-4">
                    <p className={`text-sm mb-2 ${hideHeader ? 'text-gray-500' : 'text-gray-500'}`}>Brands</p>
                    <div className="flex flex-wrap gap-2">
                      {BRANDS.filter((b) => selectedLead.selectedBrands.includes(b.id)).map((brand) => (
                        <span
                          key={brand.id}
                          className="px-3 py-1 rounded-lg text-white text-sm"
                          style={{ backgroundColor: brand.color }}
                        >
                          {brand.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm mb-2 ${hideHeader ? 'text-gray-500' : 'text-gray-500'}`}>Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.filter((c) => selectedLead.selectedCategories.includes(c.id)).map((cat) => (
                        <span
                          key={cat.id}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            hideHeader
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedLead.notes && (
                    <div className="mt-4">
                      <p className={`text-sm mb-2 ${hideHeader ? 'text-gray-500' : 'text-gray-500'}`}>Notes</p>
                      <p className={`p-3 rounded-lg text-sm ${
                        hideHeader
                          ? 'text-gray-700 bg-gray-100'
                          : 'text-gray-300 bg-white/5'
                      }`}>{selectedLead.notes}</p>
                    </div>
                  )}
                </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
