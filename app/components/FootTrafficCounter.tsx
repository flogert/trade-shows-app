'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useFormStore } from '../store/formStore';
import { BOOTH_SECTIONS } from '../types';
import { exportFootTrafficToExcel, exportAllDataToExcel } from '../utils/export';
import {
  ArrowLeft,
  Users,
  Plus,
  Minus,
  RotateCcw,
  TrendingUp,
  Clock,
  Target,
  Zap,
  BarChart3,
  Footprints,
  Timer,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download,
  FileSpreadsheet,
} from 'lucide-react';

interface FootTrafficCounterProps {
  onBack: () => void;
  hideHeader?: boolean;
}

export default function FootTrafficCounter({ onBack, hideHeader = false }: FootTrafficCounterProps) {
  const { 
    footTrafficEntries, 
    allSubmissions,
    incrementFootTraffic, 
    addFootTraffic,
    clearFootTraffic 
  } = useFormStore();
  
  const [quickAddAmount, setQuickAddAmount] = useState(1);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [notes, setNotes] = useState('');
  const [animateCount, setAnimateCount] = useState(false);

  // Calculate metrics
  const today = new Date().toDateString();
  const todayEntries = footTrafficEntries.filter(
    (entry) => new Date(entry.timestamp).toDateString() === today
  );
  const totalToday = todayEntries.reduce((sum, entry) => sum + entry.count, 0);
  const totalAllTime = footTrafficEntries.reduce((sum, entry) => sum + entry.count, 0);
  const totalLeads = allSubmissions.length;
  const conversionRate = totalToday > 0 ? ((totalLeads / totalToday) * 100).toFixed(1) : '0';

  // Calculate hourly data for today
  const hourlyData = calculateHourlyData(todayEntries);
  const peakHour = findPeakHour(hourlyData);
  const currentHour = new Date().getHours();
  const currentHourCount = hourlyData.find(h => h.hourNum === currentHour)?.count || 0;
  
  // Calculate average per hour (only counting hours with activity)
  const activeHours = hourlyData.filter(h => h.count > 0);
  const avgPerHour = activeHours.length > 0 
    ? Math.round(activeHours.reduce((sum, h) => sum + h.count, 0) / activeHours.length)
    : 0;

  const handleIncrement = useCallback((amount: number = 1) => {
    if (selectedSection || notes) {
      addFootTraffic(amount, selectedSection || undefined, notes || undefined);
      setNotes('');
    } else {
      incrementFootTraffic(amount);
    }
    setAnimateCount(true);
    setTimeout(() => setAnimateCount(false), 200);
  }, [selectedSection, notes, addFootTraffic, incrementFootTraffic]);

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all foot traffic data? This cannot be undone.')) {
      clearFootTraffic();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleIncrement(quickAddAmount);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setQuickAddAmount(prev => Math.min(prev + 1, 10));
      } else if (e.key === '-') {
        e.preventDefault();
        setQuickAddAmount(prev => Math.max(prev - 1, 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleIncrement, quickAddAmount]);

  const handleExportTraffic = () => {
    if (footTrafficEntries.length === 0) {
      alert('No foot traffic data to export');
      return;
    }
    exportFootTrafficToExcel(footTrafficEntries, allSubmissions);
  };

  const handleExportAll = () => {
    if (footTrafficEntries.length === 0 && allSubmissions.length === 0) {
      alert('No data to export');
      return;
    }
    exportAllDataToExcel(allSubmissions, footTrafficEntries);
  };

  return (
    <div className={hideHeader ? "p-4 md:p-6" : "min-h-screen bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50 p-4 md:p-6"}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {!hideHeader && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Footprints className="w-8 h-8 text-indigo-600" />
                Foot Traffic Counter
              </h1>
              <p className="text-gray-500 mt-1">Track booth visitors in real-time</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportTraffic}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-green-500 to-emerald-500 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" /> Export Traffic
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportAll}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                <FileSpreadsheet className="w-4 h-4" /> Export All Data
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBack}
                className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Main Counter Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Big Counter Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
              <div className="flex flex-col items-center">
                {/* Main Count Display */}
                <motion.div
                  animate={animateCount ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.2 }}
                  className="text-7xl md:text-9xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4"
                >
                  {totalToday.toLocaleString()}
                </motion.div>
                <p className="text-gray-500 text-lg mb-8">visitors today</p>

                {/* Quick Add Amount Selector */}
                <div className="flex items-center gap-4 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuickAddAmount(prev => Math.max(1, prev - 1))}
                    className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-5 h-5 text-gray-600" />
                  </motion.button>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">+{quickAddAmount}</div>
                    <div className="text-xs text-gray-500">per click</div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuickAddAmount(prev => Math.min(10, prev + 1))}
                    className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>

                {/* Main Click Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleIncrement(quickAddAmount)}
                  className="w-full max-w-md h-32 md:h-40 rounded-3xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-2xl md:text-3xl shadow-2xl hover:shadow-indigo-500/30 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <Users className="w-10 h-10 md:w-12 md:h-12" />
                  <span>TAP TO COUNT</span>
                  <span className="text-sm font-normal opacity-80">Space / Enter</span>
                </motion.button>

                {/* Quick Add Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  {[1, 2, 5, 10].map((num) => (
                    <motion.button
                      key={num}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleIncrement(num)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        num === quickAddAmount
                          ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      +{num}
                    </motion.button>
                  ))}
                </div>

                {/* Advanced Options Toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="mt-6 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span className="text-sm">Advanced Options</span>
                </button>

                {/* Advanced Options */}
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="w-full max-w-md mt-4 overflow-hidden"
                    >
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Booth Section (optional)
                          </label>
                          <select
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none transition-colors"
                          >
                            <option value="">All Areas</option>
                            {BOOTH_SECTIONS.map((section) => (
                              <option key={section.id} value={section.id}>
                                {section.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (optional)
                          </label>
                          <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Group tour, busy period..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Conversion Rate */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  Conversion
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-800">{conversionRate}%</div>
              <p className="text-sm text-gray-500 mt-1">
                {totalLeads} leads from {totalToday} visitors
              </p>
            </div>

            {/* Peak Hour */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                  Peak Hour
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-800">{peakHour.hour}</div>
              <p className="text-sm text-gray-500 mt-1">
                {peakHour.count} visitors at peak
              </p>
            </div>

            {/* Average per Hour */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  Avg/Hour
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-800">{avgPerHour}</div>
              <p className="text-sm text-gray-500 mt-1">
                visitors per active hour
              </p>
            </div>

            {/* Current Hour */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  This Hour
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-800">{currentHourCount}</div>
              <p className="text-sm text-gray-500 mt-1">
                visitors since {formatHour(currentHour)}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Hourly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Hourly Traffic
              </h2>
              <p className="text-sm text-gray-500 mt-1">Visitor distribution throughout the day</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">All-time total</div>
              <div className="text-2xl font-bold text-gray-800">{totalAllTime.toLocaleString()}</div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`${value} visitors`, 'Traffic']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {hourlyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.hourNum === currentHour ? '#6366f1' : '#c7d2fe'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Timer className="w-5 h-5 text-indigo-600" />
                Recent Activity
              </h2>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportTraffic}
                  className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-sm font-medium hover:bg-green-100 transition-colors flex items-center gap-1"
                  title="Export foot traffic data"
                >
                  <Download className="w-3 h-3" />
                  Export
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearAll}
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </motion.button>
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {todayEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Footprints className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No activity recorded today</p>
                  <p className="text-sm">Start counting visitors!</p>
                </div>
              ) : (
                [...todayEntries].reverse().slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Users className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          +{entry.count} visitor{entry.count !== 1 ? 's' : ''}
                        </div>
                        {entry.boothSection && (
                          <div className="text-xs text-gray-500">
                            {BOOTH_SECTIONS.find(s => s.id === entry.boothSection)?.name || entry.boothSection}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(entry.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Tips & Keyboard Shortcuts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100 p-6"
          >
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Tips & Shortcuts
            </h2>

            <div className="space-y-4">
              <div className="bg-white/70 backdrop-blur rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">⌨️ Keyboard Shortcuts</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Space</kbd>
                    <span className="text-gray-600">Count</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Enter</kbd>
                    <span className="text-gray-600">Count</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">+</kbd>
                    <span className="text-gray-600">Increase amount</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">-</kbd>
                    <span className="text-gray-600">Decrease amount</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">💡 Pro Tips</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500">•</span>
                    Use the big button or spacebar to count quickly
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500">•</span>
                    Adjust +amount for counting groups
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500">•</span>
                    Track booth sections to identify hot spots
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500">•</span>
                    Compare conversion rate to optimize engagement
                  </li>
                </ul>
              </div>

              <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 border border-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Data is saved automatically</p>
                  <p className="text-amber-700">Your count persists even if you close the browser</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function calculateHourlyData(entries: { timestamp: string; count: number }[]) {
  const hours = [
    { hour: '8 AM', hourNum: 8 },
    { hour: '9 AM', hourNum: 9 },
    { hour: '10 AM', hourNum: 10 },
    { hour: '11 AM', hourNum: 11 },
    { hour: '12 PM', hourNum: 12 },
    { hour: '1 PM', hourNum: 13 },
    { hour: '2 PM', hourNum: 14 },
    { hour: '3 PM', hourNum: 15 },
    { hour: '4 PM', hourNum: 16 },
    { hour: '5 PM', hourNum: 17 },
    { hour: '6 PM', hourNum: 18 },
  ];

  const hourlyMap: Record<number, number> = {};
  entries.forEach((entry) => {
    const hour = new Date(entry.timestamp).getHours();
    hourlyMap[hour] = (hourlyMap[hour] || 0) + entry.count;
  });

  return hours.map((h) => ({
    ...h,
    count: hourlyMap[h.hourNum] || 0,
  }));
}

function findPeakHour(hourlyData: { hour: string; hourNum: number; count: number }[]) {
  const peak = hourlyData.reduce(
    (max, current) => (current.count > max.count ? current : max),
    { hour: 'N/A', hourNum: 0, count: 0 }
  );
  return peak;
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:00 ${period}`;
}
