'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useFormStore } from '../store/formStore';
import { HeatmapZone } from '../types';
import {
  generateMockMetrics,
  generateHourlyData,
  generateDemographics,
  generateHeatmapData,
  calculateFootTrafficMetrics,
} from '../utils/analytics';
import {
  ArrowLeft,
  Users,
  Clock,
  RotateCcw,
  Target,
  Flame,
  Thermometer,
  Snowflake,
  BarChart3,
  Tag,
  Package,
  Building2,
  Map,
  TrendingUp,
  TrendingDown,
  Award,
  Pause,
  Play,
  Footprints,
} from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

interface AnalyticsDashboardProps {
  onBack: () => void;
  hideHeader?: boolean;
}

export default function AnalyticsDashboard({ onBack, hideHeader = false }: AnalyticsDashboardProps) {
  const { allSubmissions, footTrafficEntries } = useFormStore();
  const [metrics, setMetrics] = useState(() => generateMockMetrics(allSubmissions));
  const [hourlyData, setHourlyData] = useState(() => generateHourlyData(allSubmissions));
  const [demographics, setDemographics] = useState(() => generateDemographics(allSubmissions));
  const [heatmapData, setHeatmapData] = useState(() => generateHeatmapData(allSubmissions));
  const [selectedZone, setSelectedZone] = useState<HeatmapZone | null>(null);
  const [isLive, setIsLive] = useState(true);

  // Calculate foot traffic metrics
  const footTrafficMetrics = calculateFootTrafficMetrics(footTrafficEntries, allSubmissions);

  // Update heatmap when submissions change
  useEffect(() => {
    setHeatmapData(generateHeatmapData(allSubmissions));
    setDemographics(generateDemographics(allSubmissions));
    setMetrics(generateMockMetrics(allSubmissions));
  }, [allSubmissions]);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalVisitors: prev.totalVisitors + Math.floor(Math.random() * 3),
        uniqueVisitors: prev.uniqueVisitors + Math.floor(Math.random() * 2),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 90) return 'rgba(239, 68, 68, 0.7)';
    if (intensity >= 70) return 'rgba(249, 115, 22, 0.6)';
    if (intensity >= 50) return 'rgba(234, 179, 8, 0.5)';
    if (intensity >= 20) return 'rgba(34, 197, 94, 0.4)';
    return 'rgba(100, 116, 139, 0.3)';
  };

  const containerClassName = hideHeader
    ? 'min-h-dvh bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50 p-3 sm:p-4 md:p-6 embed-light'
    : 'min-h-dvh bg-linear-to-br from-slate-900 via-indigo-950 to-purple-950 p-3 sm:p-4 md:p-6';

  const chartTheme = {
    grid: hideHeader ? '#e2e8f0' : '#ffffff20',
    axis: hideHeader ? '#64748b' : '#ffffff60',
    tooltipBg: hideHeader ? '#ffffff' : '#1e1b4b',
    tooltipBorder: hideHeader ? '#cbd5e1' : '#6366f1',
    tooltipLabel: hideHeader ? '#0f172a' : '#ffffff',
  };

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
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Live Analytics</h1>
                <p className="text-indigo-300 text-xs sm:text-sm">Real-time booth performance insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2" role="status" aria-live="polite">
                <motion.div
                  animate={{ scale: isLive ? [1, 1.2, 1] : 1 }}
                  transition={{ repeat: isLive ? Infinity : 0, duration: 1.5 }}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-500'}`}
                  aria-hidden="true"
                />
                <span className="text-white text-xs sm:text-sm">{isLive ? 'Live' : 'Paused'}</span>
              </div>
              <button
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isLive
                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 focus:ring-red-500'
                    : 'bg-green-500/20 text-green-300 hover:bg-green-500/30 focus:ring-green-500'
                }`}
                aria-pressed={isLive}
              >
                {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isLive ? 'Pause' : 'Resume'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Key Metrics */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6"
          role="region"
          aria-label="Key metrics"
        >
          <MetricCard
            title="Total Visitors"
            value={metrics.totalVisitors}
            icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
            trend={{ direction: 'up', value: 12 }}
            color="indigo"
            delay={0.15}
          />
          <MetricCard
            title="Avg Dwell Time"
            value={formatTime(Math.round(metrics.averageDwellTime))}
            icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
            trend={{ direction: 'up', value: 8 }}
            color="purple"
            delay={0.2}
          />
          <MetricCard
            title="Bounce Rate"
            value={`${metrics.bounceRate.toFixed(1)}%`}
            icon={<RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />}
            trend={{ direction: 'down', value: 5 }}
            color="pink"
            invertTrend
            delay={0.25}
          />
          <MetricCard
            title="Conversion Rate"
            value={`${metrics.conversionRate.toFixed(1)}%`}
            icon={<Target className="w-5 h-5 sm:w-6 sm:h-6" />}
            trend={{ direction: 'up', value: 15 }}
            color="emerald"
            delay={0.3}
          />
        </motion.div>

        {/* Foot Traffic Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.32, duration: 0.4, ease: 'easeOut' }}
          className={`${hideHeader ? 'bg-white border border-gray-200' : 'bg-white/10'} rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6`}
          role="region"
          aria-label="Foot traffic summary"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${hideHeader ? 'bg-indigo-100' : 'bg-indigo-500/20'}`}>
              <Footprints className={`w-5 h-5 ${hideHeader ? 'text-indigo-600' : 'text-indigo-300'}`} />
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${hideHeader ? 'text-gray-800' : 'text-white'}`}>Foot Traffic Today</h3>
              <p className={`text-xs ${hideHeader ? 'text-gray-500' : 'text-indigo-300'}`}>Visitors passing by booth</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl sm:text-3xl font-bold ${hideHeader ? 'text-gray-800' : 'text-white'}`}>
                {footTrafficMetrics.todayCount.toLocaleString()}
              </div>
              <div className={`text-xs ${hideHeader ? 'text-gray-500' : 'text-indigo-300'}`}>Total Visitors</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl sm:text-3xl font-bold ${hideHeader ? 'text-gray-800' : 'text-white'}`}>
                {footTrafficMetrics.peakHour}
              </div>
              <div className={`text-xs ${hideHeader ? 'text-gray-500' : 'text-indigo-300'}`}>Peak Hour</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl sm:text-3xl font-bold ${hideHeader ? 'text-gray-800' : 'text-white'}`}>
                {footTrafficMetrics.averagePerHour}
              </div>
              <div className={`text-xs ${hideHeader ? 'text-gray-500' : 'text-indigo-300'}`}>Avg/Hour</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl sm:text-3xl font-bold ${hideHeader ? 'text-green-600' : 'text-green-400'}`}>
                {footTrafficMetrics.conversionRate.toFixed(1)}%
              </div>
              <div className={`text-xs ${hideHeader ? 'text-gray-500' : 'text-indigo-300'}`}>Lead Conversion</div>
            </div>
          </div>
        </motion.div>

        {/* Lead Temperature */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4, ease: 'easeOut' }}
          className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6"
          role="region"
          aria-label="Lead temperature breakdown"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-linear-to-br from-red-500/20 to-orange-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-red-500/30"
          >
            <div className="flex items-center justify-between">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" aria-hidden="true" />
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl sm:text-3xl font-bold text-red-400"
              >
                {metrics.hotLeads}
              </motion.span>
            </div>
            <p className="text-red-300 text-xs sm:text-sm mt-1 sm:mt-2">Hot Leads</p>
            <p className="text-red-400/60 text-xs hidden sm:block">Score 70+</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
            className="bg-linear-to-br from-amber-500/20 to-yellow-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-500/30"
          >
            <div className="flex items-center justify-between">
              <Thermometer className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" aria-hidden="true" />
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="text-2xl sm:text-3xl font-bold text-amber-400"
              >
                {metrics.warmLeads}
              </motion.span>
            </div>
            <p className="text-amber-300 text-xs sm:text-sm mt-1 sm:mt-2">Warm Leads</p>
            <p className="text-amber-400/60 text-xs hidden sm:block">Score 45-69</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-linear-to-br from-blue-500/20 to-cyan-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-500/30"
          >
            <div className="flex items-center justify-between">
              <Snowflake className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" aria-hidden="true" />
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-2xl sm:text-3xl font-bold text-blue-400"
              >
                {metrics.coldLeads}
              </motion.span>
            </div>
            <p className="text-blue-300 text-xs sm:text-sm mt-1 sm:mt-2">Cold Leads</p>
            <p className="text-blue-400/60 text-xs hidden sm:block">Score &lt;45</p>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Hourly Traffic Chart */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-white/5 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" aria-hidden="true" />
              Hourly Traffic
            </h3>
            <div className="h-52 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis dataKey="hour" stroke={chartTheme.axis} fontSize={10} />
                  <YAxis stroke={chartTheme.axis} fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      border: `1px solid ${chartTheme.tooltipBorder}`,
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: chartTheme.tooltipLabel }}
                    itemStyle={{ color: chartTheme.tooltipLabel }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorVisitors)"
                    name="Visitors"
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="#ec4899"
                    fillOpacity={1}
                    fill="url(#colorLeads)"
                    name="Leads"
                    animationDuration={1200}
                    animationEasing="ease-out"
                    animationBegin={200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Brand Interest */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-white/5 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" aria-hidden="true" />
              Brand Interest
            </h3>
            <div className="h-50 sm:h-62">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographics.brands} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis type="number" stroke={chartTheme.axis} fontSize={10} />
                  <YAxis dataKey="category" type="category" stroke={chartTheme.axis} fontSize={10} width={70} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      border: `1px solid ${chartTheme.tooltipBorder}`,
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: chartTheme.tooltipLabel }}
                    itemStyle={{ color: chartTheme.tooltipLabel }}
                  />
                  <Bar dataKey="value" name="Leads" radius={[0, 4, 4, 0]}>
                    {demographics.brands.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Category Distribution */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" aria-hidden="true" />
              Category Interest
            </h3>
            <div className="h-44 sm:h-50">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographics.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={70}
                    dataKey="value"
                    nameKey="category"
                  >
                    {demographics.categories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      border: `1px solid ${chartTheme.tooltipBorder}`,
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: chartTheme.tooltipLabel }}
                    itemStyle={{ color: chartTheme.tooltipLabel }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {demographics.categories.slice(0, 4).map((cat, i) => (
                <div key={cat.category} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs text-gray-400">{cat.category}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Business Type Split */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="bg-white/5 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" aria-hidden="true" />
              Business Type
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {demographics.businessType.map((item, index) => (
                <div key={item.category}>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="text-gray-300">{item.category}</span>
                    <span className="text-white font-medium">{item.value} ({item.percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2.5 sm:h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: index === 0 ? '#6366f1' : '#ec4899' }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
              <p className="text-xs sm:text-sm text-gray-400">
                {demographics.businessType[0]?.percentage > 50 
                  ? 'Wholesale-heavy audience - prepare bulk pricing materials'
                  : 'Retail-focused crowd - highlight starter kits & variety'}
              </p>
            </div>
          </motion.div>

          {/* Dwell Time Distribution */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 md:col-span-2 lg:col-span-1"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" aria-hidden="true" />
              Dwell Time
            </h3>
            <div className="h-44 sm:h-50">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis dataKey="hour" stroke={chartTheme.axis} fontSize={10} />
                  <YAxis stroke={chartTheme.axis} fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      border: `1px solid ${chartTheme.tooltipBorder}`,
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: chartTheme.tooltipLabel }}
                    itemStyle={{ color: chartTheme.tooltipLabel }}
                    formatter={(value?: number) => value !== undefined ? [`${Math.round(value / 60)}m ${value % 60}s`, 'Avg Dwell'] : ['', 'Avg Dwell']}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgDwell"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 3 }}
                    name="Avg Dwell Time"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Booth Heatmap */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="bg-white/5 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
        >
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Map className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" aria-hidden="true" />
            Booth Heatmap
            <span className="text-xs text-gray-400 font-normal ml-2 hidden sm:inline">Click zones for details</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Heatmap Visualization */}
            <div className="lg:col-span-2">
              <div 
                className="relative bg-slate-800/50 rounded-xl overflow-hidden" 
                style={{ aspectRatio: '16/10' }}
                role="img"
                aria-label="Booth heatmap showing visitor concentration in different zones"
              >
                {/* Grid lines */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <defs>
                    <pattern id="grid" width="10%" height="10%" patternUnits="userSpaceOnUse">
                      <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Heatmap zones */}
                {heatmapData.map((zone) => (
                  <motion.button
                    key={zone.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedZone(zone)}
                    className="absolute cursor-pointer rounded-lg border-2 border-white/20 transition-all hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{
                      left: `${zone.x}%`,
                      top: `${zone.y}%`,
                      width: `${zone.width}%`,
                      height: `${zone.height}%`,
                      backgroundColor: getIntensityColor(zone.intensity),
                    }}
                    aria-label={`${zone.name}: ${zone.visitors} visitors, ${zone.intensity}% intensity`}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-1 sm:p-2">
                      <span className="text-white text-[10px] sm:text-xs font-medium text-center drop-shadow-lg line-clamp-2">
                        {zone.name}
                      </span>
                      <span className="text-white/80 text-[9px] sm:text-xs hidden sm:block">{zone.visitors} visitors</span>
                    </div>
                  </motion.button>
                ))}

                {/* Legend */}
                <div className="absolute bottom-2 right-2 bg-black/50 rounded-lg p-1.5 sm:p-2 backdrop-blur">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-white">
                    <span>Low</span>
                    <div className="flex gap-0.5">
                      {['#64748b', '#22c55e', '#eab308', '#f97316', '#ef4444'].map((color) => (
                        <div key={color} className="w-3 sm:w-4 h-2 sm:h-3 rounded" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Zone Details */}
            <div className="space-y-3 sm:space-y-4">
              <AnimatePresence mode="wait">
                {selectedZone ? (
                  <motion.div
                    key={selectedZone.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white/10 rounded-xl p-3 sm:p-4"
                  >
                    <h4 className="text-white font-semibold mb-2 sm:mb-3">{selectedZone.name}</h4>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Visitors</span>
                        <span className="text-white font-medium">{selectedZone.visitors}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Dwell</span>
                        <span className="text-white font-medium">{formatTime(selectedZone.avgDwell)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Intensity</span>
                        <span className="text-white font-medium">{selectedZone.intensity}%</span>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs text-gray-400">
                          {selectedZone.intensity >= 80
                            ? 'High-traffic zone - consider adding more staff'
                            : selectedZone.intensity >= 50
                            ? 'Good engagement - maintain current setup'
                            : selectedZone.intensity >= 20
                            ? 'Moderate traffic - monitor performance'
                            : 'Low traffic - consider repositioning displays'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/5 rounded-xl p-3 sm:p-4 text-center text-gray-400 text-sm"
                  >
                    <p>Click a zone to see details</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Top Zones */}
              <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm">Top Performing Zones</h4>
                <div className="space-y-2">
                  {[...heatmapData]
                    .sort((a, b) => b.intensity - a.intensity)
                    .slice(0, 3)
                    .map((zone, i) => (
                      <div key={zone.id} className="flex items-center gap-2">
                        <Award className={`w-4 h-4 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : 'text-amber-600'}`} aria-hidden="true" />
                        <span className="text-gray-300 flex-1 text-xs sm:text-sm truncate">{zone.name}</span>
                        <span className="text-white font-medium text-xs sm:text-sm">{zone.intensity}%</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  icon,
  trend,
  color,
  invertTrend = false,
  delay = 0,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: { direction: 'up' | 'down' | 'neutral'; value: number };
  color: 'indigo' | 'purple' | 'pink' | 'emerald';
  invertTrend?: boolean;
  delay?: number;
}) {
  const colorClasses = {
    indigo: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
  };

  const iconColors = {
    indigo: 'text-indigo-400',
    purple: 'text-purple-400',
    pink: 'text-pink-400',
    emerald: 'text-emerald-400',
  };

  const trendColor = invertTrend
    ? trend.direction === 'down' ? 'text-green-400' : 'text-red-400'
    : trend.direction === 'up' ? 'text-green-400' : 'text-red-400';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay, 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={`bg-linear-to-br ${colorClasses[color]} rounded-xl sm:rounded-2xl p-3 sm:p-4 border`}
    >
      <div className="flex items-start justify-between mb-1 sm:mb-2">
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.1, type: 'spring', stiffness: 200 }}
          className={iconColors[color]} 
          aria-hidden="true"
        >
          {icon}
        </motion.span>
        {trend.direction !== 'neutral' && (
          <motion.span 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.2 }}
            className={`text-[10px] sm:text-xs font-medium ${trendColor} flex items-center gap-0.5`}
          >
            {trend.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}%
          </motion.span>
        )}
      </div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.15 }}
        className="text-white text-lg sm:text-2xl font-bold"
      >
        {value}
      </motion.p>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
        className="text-gray-400 text-xs sm:text-sm"
      >
        {title}
      </motion.p>
    </motion.div>
  );
}
