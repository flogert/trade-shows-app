'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormStore } from '../store/formStore';
import { CustomerData, BRANDS, BOOTH_SECTIONS, CATEGORIES, SALESPEOPLE } from '../types';
import { exportToExcel, generateEmailContent, copyToClipboard } from '../utils/export';
import { generateBulkAnalysis } from '../utils/ai';
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  Copy,
  Check, 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Bot, 
  Inbox, 
  PlusCircle, 
  Trash2,
  X,
  User,
  MapPin,
  Sparkles,
  Clock,
  TrendingUp,
  Target,
  Zap,
  Star,
  Phone,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  onBackToForm: () => void;
  hideHeader?: boolean;
}

export default function Dashboard({ onBackToForm, hideHeader = false }: DashboardProps) {
  const { allSubmissions, clearAllSubmissions } = useFormStore();
  const [selectedLead, setSelectedLead] = useState<CustomerData | null>(null);
  const [copied, setCopied] = useState(false);
  const [bulkAnalysis, setBulkAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCopied, setAnalysisCopied] = useState(false);
  const [analysisGeneratedAt, setAnalysisGeneratedAt] = useState<string | null>(null);
  const [activeInsightTab, setActiveInsightTab] = useState<'overview' | 'opportunities' | 'actions'>('overview');

  const handleExport = () => {
    if (allSubmissions.length === 0) {
      alert('No leads to export');
      return;
    }
    exportToExcel(allSubmissions);
  };

  const handleEmailContent = async () => {
    if (allSubmissions.length === 0) {
      alert('No leads to export');
      return;
    }
    const content = generateEmailContent(allSubmissions);
    await copyToClipboard(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBulkAnalysis = async () => {
    if (allSubmissions.length === 0) {
      alert('No leads to analyze');
      return;
    }
    setIsAnalyzing(true);
    const analysis = await generateBulkAnalysis(allSubmissions);
    setBulkAnalysis(analysis);
    setAnalysisGeneratedAt(new Date().toLocaleString());
    setIsAnalyzing(false);
  };

  const handleCopyAnalysis = async () => {
    if (!bulkAnalysis) return;
    await copyToClipboard(bulkAnalysis);
    setAnalysisCopied(true);
    setTimeout(() => setAnalysisCopied(false), 2000);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all submissions? This cannot be undone.')) {
      clearAllSubmissions();
    }
  };

  const stats = {
    total: allSubmissions.length,
    wholesale: allSubmissions.filter((s) => s.businessType === 'wholesale').length,
    retail: allSubmissions.filter((s) => s.businessType === 'retail').length,
  };

  const getSalespersonName = (id?: string) =>
    SALESPEOPLE.find((s) => s.id === id)?.name || id || '-';

  const getBoothSectionName = (id?: string) =>
    BOOTH_SECTIONS.find((s) => s.id === id)?.name || id || '-';

  return (
    <div className={hideHeader ? "p-4 md:p-8" : "min-h-screen bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50 p-4 md:p-8"}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {!hideHeader && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Lead Dashboard</h1>
              <p className="text-gray-500">Manage and export your trade show leads</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBackToForm}
                className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                aria-label="Create new entry"
              >
                <ArrowLeft className="w-4 h-4" /> New Entry
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-green-500 to-emerald-500 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                aria-label="Export leads to Excel"
              >
                <Download className="w-4 h-4" /> Export XLSX
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEmailContent}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                aria-label="Copy leads for email"
              >
                {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Mail className="w-4 h-4" /> Copy for Email</>}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Embedded Action Bar (when using TopNav) */}
        {hideHeader && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-wrap items-center justify-end gap-3 mb-6"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-green-500 to-emerald-500 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              aria-label="Export leads to Excel"
            >
              <Download className="w-4 h-4" /> Export XLSX
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEmailContent}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              aria-label="Copy leads for email"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" /> Copy for Email
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-2">
              <BarChart3 className="w-8 h-8 text-indigo-500" aria-hidden="true" />
            </div>
            <p className="text-gray-500 text-sm">Total Leads</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-linear-to-br from-indigo-500 to-purple-500 rounded-2xl p-6 shadow-md text-white">
            <div className="mb-2">
              <Package className="w-8 h-8 text-white/90" aria-hidden="true" />
            </div>
            <p className="text-indigo-100 text-sm">Wholesale</p>
            <p className="text-3xl font-bold">{stats.wholesale}</p>
          </div>
          <div className="bg-linear-to-br from-pink-500 to-rose-500 rounded-2xl p-6 shadow-md text-white">
            <div className="mb-2">
              <ShoppingBag className="w-8 h-8 text-white/90" aria-hidden="true" />
            </div>
            <p className="text-pink-100 text-sm">Retail</p>
            <p className="text-3xl font-bold">{stats.retail}</p>
          </div>
        </motion.div>

        {/* AI Analysis Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-100">
                  <Bot className="w-5 h-5 text-indigo-700" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">AI Lead Intelligence</h2>
                  <p className="text-gray-600 text-sm">
                    Summarizes patterns across {allSubmissions.length} lead{allSubmissions.length === 1 ? '' : 's'} to help prioritize follow-ups.
                  </p>
                  {analysisGeneratedAt && (
                    <p className="text-xs text-gray-500 mt-1">Last generated: {analysisGeneratedAt}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                {bulkAnalysis && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopyAnalysis}
                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-800 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                    aria-label="Copy AI analysis"
                  >
                    {analysisCopied ? (
                      <>
                        <Check className="w-4 h-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy
                      </>
                    )}
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBulkAnalysis}
                  disabled={isAnalyzing || allSubmissions.length === 0}
                  className="px-4 py-2 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  aria-label="Generate AI analysis of leads"
                >
                  {isAnalyzing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Analyzing
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" aria-hidden="true" />
                      Generate
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {isAnalyzing && !bulkAnalysis && (
              <div className="rounded-xl border border-gray-200 bg-linear-to-br from-indigo-50 to-purple-50 p-4">
                <div className="h-3 w-40 bg-indigo-200/60 rounded mb-3 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-indigo-200/50 rounded animate-pulse" />
                  <div className="h-3 w-11/12 bg-indigo-200/40 rounded animate-pulse" />
                  <div className="h-3 w-10/12 bg-indigo-200/40 rounded animate-pulse" />
                </div>
              </div>
            )}

            {bulkAnalysis ? (
              <div className="rounded-xl border border-indigo-100 bg-linear-to-br from-indigo-50 to-purple-50 p-4">
                {/* Interactive Tabs */}
                <div className="flex gap-1 mb-4 p-1 bg-white/60 rounded-lg w-fit">
                  {(['overview', 'opportunities', 'actions'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveInsightTab(tab)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                        activeInsightTab === tab
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-white hover:text-gray-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeInsightTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {/* Quick Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="bg-white/80 rounded-lg p-3 border border-white">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-gray-500">Top Brand</span>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {(() => {
                              const brandCounts = allSubmissions.flatMap(s => s.selectedBrands)
                                .reduce((acc, id) => ({ ...acc, [id]: (acc[id] || 0) + 1 }), {} as Record<string, number>);
                              const topBrandId = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
                              return BRANDS.find(b => b.id === topBrandId)?.name || 'N/A';
                            })()}
                          </p>
                        </div>
                        <div className="bg-white/80 rounded-lg p-3 border border-white">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs text-gray-500">Top Category</span>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {(() => {
                              const catCounts = allSubmissions.flatMap(s => s.selectedCategories)
                                .reduce((acc, id) => ({ ...acc, [id]: (acc[id] || 0) + 1 }), {} as Record<string, number>);
                              const topCatId = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
                              return CATEGORIES.find(c => c.id === topCatId)?.name || 'N/A';
                            })()}
                          </p>
                        </div>
                        <div className="bg-white/80 rounded-lg p-3 border border-white">
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-amber-600" />
                            <span className="text-xs text-gray-500">Avg Interests</span>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {allSubmissions.length > 0 
                              ? (allSubmissions.reduce((sum, s) => sum + s.selectedBrands.length + s.selectedCategories.length, 0) / allSubmissions.length).toFixed(1)
                              : '0'}
                          </p>
                        </div>
                        <div className="bg-white/80 rounded-lg p-3 border border-white">
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="w-4 h-4 text-purple-600" />
                            <span className="text-xs text-gray-500">With Notes</span>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {allSubmissions.filter(s => s.notes && s.notes.trim()).length}
                          </p>
                        </div>
                      </div>

                      {/* Brand Interest Bar */}
                      <div className="bg-white/80 rounded-lg p-3 border border-white">
                        <p className="text-xs text-gray-500 mb-2">Brand Interest Distribution</p>
                        <div className="flex gap-1 h-6 rounded-md overflow-hidden">
                          {(() => {
                            const brandCounts = allSubmissions.flatMap(s => s.selectedBrands)
                              .reduce((acc, id) => ({ ...acc, [id]: (acc[id] || 0) + 1 }), {} as Record<string, number>);
                            const total = Object.values(brandCounts).reduce((a, b) => a + b, 0) || 1;
                            return BRANDS.filter(b => brandCounts[b.id]).map(brand => (
                              <div
                                key={brand.id}
                                style={{ 
                                  width: `${(brandCounts[brand.id] / total) * 100}%`,
                                  backgroundColor: brand.color 
                                }}
                                className="h-full transition-all hover:opacity-80 cursor-pointer"
                                title={`${brand.name}: ${brandCounts[brand.id]} selections`}
                              />
                            ));
                          })()}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {BRANDS.slice(0, 4).map(brand => (
                            <span key={brand.id} className="flex items-center gap-1 text-xs text-gray-600">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: brand.color }} />
                              {brand.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeInsightTab === 'opportunities' && (
                    <motion.div
                      key="opportunities"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      {/* High-value leads */}
                      {allSubmissions
                        .filter(s => s.selectedBrands.length >= 2 || s.notes)
                        .slice(0, 3)
                        .map((lead, i) => (
                          <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => setSelectedLead(lead)}
                            className="bg-white/80 rounded-lg p-3 border border-white flex items-center gap-3 cursor-pointer hover:bg-white transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {lead.firstName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm">{lead.firstName} {lead.lastName}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {lead.selectedBrands.length} brands • {lead.businessType}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                          </motion.div>
                        ))}
                      {allSubmissions.filter(s => s.selectedBrands.length >= 2 || s.notes).length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No high-value opportunities identified yet</p>
                      )}
                    </motion.div>
                  )}

                  {activeInsightTab === 'actions' && (
                    <motion.div
                      key="actions"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      {/* Contact preference breakdown */}
                      <div className="bg-white/80 rounded-lg p-3 border border-white">
                        <p className="text-xs text-gray-500 mb-2">Contact Preferences</p>
                        <div className="grid grid-cols-3 gap-2">
                          {(['email', 'phone', 'text'] as const).map(pref => {
                            const count = allSubmissions.filter(s => s.preferredContact === pref).length;
                            const percentage = allSubmissions.length > 0 ? Math.round((count / allSubmissions.length) * 100) : 0;
                            return (
                              <div key={pref} className="text-center">
                                <div className={`w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center ${
                                  pref === 'email' ? 'bg-blue-100 text-blue-600' :
                                  pref === 'phone' ? 'bg-green-100 text-green-600' :
                                  'bg-purple-100 text-purple-600'
                                }`}>
                                  {pref === 'email' ? <Mail className="w-4 h-4" /> :
                                   pref === 'phone' ? <Phone className="w-4 h-4" /> :
                                   <MessageSquare className="w-4 h-4" />}
                                </div>
                                <p className="font-semibold text-gray-900 text-sm">{percentage}%</p>
                                <p className="text-xs text-gray-500 capitalize">{pref}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Recommended Actions */}
                      <div className="bg-white/80 rounded-lg p-3 border border-white">
                        <p className="text-xs text-gray-500 mb-2">Recommended Next Steps</p>
                        <div className="space-y-2">
                          {allSubmissions.filter(s => s.preferredContact === 'email').length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <span className="text-blue-500">✓</span>
                              Send email follow-ups to {allSubmissions.filter(s => s.preferredContact === 'email').length} leads
                            </div>
                          )}
                          {allSubmissions.filter(s => s.preferredContact === 'phone').length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <span className="text-green-500">✓</span>
                              Schedule calls with {allSubmissions.filter(s => s.preferredContact === 'phone').length} leads
                            </div>
                          )}
                          {stats.wholesale > stats.retail && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <span className="text-indigo-500">✓</span>
                              Focus on wholesale pricing packages
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-gray-600 text-sm">
                  Generate an AI summary to identify top opportunities, common needs, and recommended next actions.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Leads Table */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">All Leads</h2>
            {allSubmissions.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {allSubmissions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <Inbox className="w-12 h-12 text-gray-300" aria-hidden="true" />
              </div>
              <p className="text-gray-500">No leads collected yet</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBackToForm}
                className="mt-4 px-6 py-2 rounded-xl bg-indigo-100 text-indigo-700 font-medium inline-flex items-center gap-2"
                aria-label="Collect your first lead"
              >
                <PlusCircle className="w-4 h-4" /> Collect your first lead
              </motion.button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Salesperson</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Business</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Brands</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allSubmissions.map((lead, index) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{lead.firstName} {lead.lastName}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="font-medium text-gray-800">{getSalespersonName(lead.salesperson)}</div>
                        <div className="text-xs text-gray-500">{getBoothSectionName(lead.boothSection)}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{lead.businessName || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lead.businessType === 'wholesale'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                          {lead.businessType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{lead.phone}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
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
                            <span className="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-600">
                              +{lead.selectedBrands.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Lead Detail Modal */}
        <AnimatePresence>
          {selectedLead && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedLead(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedLead.firstName} {selectedLead.lastName}
                  </h3>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Salesperson</p>
                      <p className="font-medium text-gray-800">{getSalespersonName(selectedLead.salesperson)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Booth Section</p>
                      <p className="font-medium text-gray-800">{getBoothSectionName(selectedLead.boothSection)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Business Name</p>
                      <p className="font-medium text-gray-800">{selectedLead.businessName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Business Type</p>
                      <p className="font-medium text-gray-800 capitalize">{selectedLead.businessType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time at Booth</p>
                      <p className="font-medium text-gray-800 flex items-center gap-1">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        {selectedLead.dwellTime 
                          ? `${Math.floor(selectedLead.dwellTime / 60)}m ${selectedLead.dwellTime % 60}s`
                          : 'Not recorded'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{selectedLead.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-800">{selectedLead.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-800">
                        {[selectedLead.address, selectedLead.city, selectedLead.state, selectedLead.zipCode]
                          .filter(Boolean)
                          .join(', ') || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Interested Brands</p>
                    <div className="flex flex-wrap gap-2">
                      {BRANDS.filter((b) => selectedLead.selectedBrands.includes(b.id)).map((brand) => (
                        <span
                          key={brand.id}
                          className="px-3 py-1 rounded-full text-white text-sm font-medium"
                          style={{ backgroundColor: brand.color }}
                        >
                          {brand.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Interested Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.filter((c) => selectedLead.selectedCategories.includes(c.id)).map((cat) => (
                        <span
                          key={cat.id}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Preferred Contact</p>
                      <p className="font-medium text-gray-800 capitalize">{selectedLead.preferredContact}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Best Time</p>
                      <p className="font-medium text-gray-800">{selectedLead.bestTimeToContact || 'Any'}</p>
                    </div>
                  </div>

                  {selectedLead.notes && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Notes</p>
                      <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-xl">{selectedLead.notes}</p>
                    </div>
                  )}

                  {selectedLead.aiInsights && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-indigo-500" aria-hidden="true" /> AI Insights
                      </p>
                      <div className="text-gray-700 bg-linear-to-br from-indigo-50 to-purple-50 p-4 rounded-xl text-sm whitespace-pre-wrap">
                        {selectedLead.aiInsights}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
