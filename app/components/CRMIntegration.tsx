'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormStore } from '../store/formStore';
import { CRMConfig } from '../types';
import {
  connectToCRM,
  syncLeadsToCRM,
  enrichLeadsFromCRM,
  getCRMFieldMapping,
  generateCRMStats,
} from '../utils/crm';
import { calculateLeadScore, enrichLeadData } from '../utils/leadScoring';
import {
  ArrowLeft,
  Plug,
  RefreshCw,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Database,
  CloudOff,
  Users,
  Clock,
  Zap,
  Check,
  Shield,
  CircleDot,
} from 'lucide-react';

interface CRMIntegrationProps {
  onBack: () => void;
  hideHeader?: boolean;
}

export default function CRMIntegration({ onBack, hideHeader = false }: CRMIntegrationProps) {
  const { allSubmissions, updateFormData } = useFormStore();
  const [crmConfig, setCrmConfig] = useState<CRMConfig>({
    platform: 'none',
    connected: false,
    autoSync: false,
    syncInterval: 15,
  });
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'hubspot' | 'salesforce' | 'salesgent' | null>(null);

  const stats = generateCRMStats(allSubmissions);

  const handleConnect = async () => {
    if (!selectedPlatform || !apiKey) return;

    setIsConnecting(true);
    const result = await connectToCRM(selectedPlatform, apiKey);
    
    if (result.success) {
      setCrmConfig({
        ...crmConfig,
        platform: selectedPlatform,
        connected: true,
        lastSync: new Date().toISOString(),
      });
    }
    
    setSyncResult(result);
    setIsConnecting(false);
    
    setTimeout(() => setSyncResult(null), 3000);
  };

  const handleDisconnect = () => {
    setCrmConfig({
      platform: 'none',
      connected: false,
      autoSync: false,
      syncInterval: 15,
    });
    setApiKey('');
    setSelectedPlatform(null);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await syncLeadsToCRM(allSubmissions, crmConfig);
    
    setSyncResult({
      success: result.success,
      message: result.success
        ? `Successfully synced ${result.syncedCount} leads`
        : `Synced ${result.syncedCount} leads, ${result.failedCount} failed`,
    });
    
    if (result.success) {
      setCrmConfig({
        ...crmConfig,
        lastSync: new Date().toISOString(),
      });
    }
    
    setIsSyncing(false);
    setTimeout(() => setSyncResult(null), 3000);
  };

  const handleEnrich = async () => {
    setIsEnriching(true);
    const enrichedData = await enrichLeadsFromCRM(allSubmissions, crmConfig);
    
    // In a real app, this would update the leads in the store
    setSyncResult({
      success: true,
      message: `Enriched ${enrichedData.size} lead profiles`,
    });
    
    setIsEnriching(false);
    setTimeout(() => setSyncResult(null), 3000);
  };

  const fieldMapping = selectedPlatform ? getCRMFieldMapping(selectedPlatform) : [];

  const containerClassName = hideHeader
    ? 'min-h-dvh bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50 p-3 sm:p-4 md:p-6 embed-light'
    : 'min-h-dvh bg-linear-to-br from-slate-900 via-indigo-950 to-purple-950 p-3 sm:p-4 md:p-6';

  return (
    <div className={containerClassName}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {!hideHeader && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6"
          >
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Go back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">CRM Integration</h1>
              <p className="text-indigo-300 text-xs sm:text-sm">Sync leads with HubSpot, Salesforce, or Salesgent</p>
            </div>
          </motion.div>
        )}

        {/* Sync Status Banner */}
        <AnimatePresence>
          {syncResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl ${
                syncResult.success
                  ? 'bg-green-500/20 border border-green-500/30'
                  : 'bg-red-500/20 border border-red-500/30'
              }`}
              role="alert"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {syncResult.success ? (
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" aria-hidden="true" />
                )}
                <span className={`text-sm sm:text-base ${syncResult.success ? 'text-green-300' : 'text-red-300'}`}>
                  {syncResult.message}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6"
          role="region"
          aria-label="CRM statistics"
        >
          <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <p className="text-gray-400 text-xs sm:text-sm">Total Leads</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalLeads}</p>
          </div>
          <div className="bg-green-500/10 rounded-xl p-3 sm:p-4 border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" aria-hidden="true" />
              <p className="text-green-400 text-xs sm:text-sm">Synced</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-green-300">{stats.synced}</p>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-3 sm:p-4 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <p className="text-amber-400 text-xs sm:text-sm">Pending</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-amber-300">{stats.pending}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-3 sm:p-4 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" aria-hidden="true" />
              <p className="text-purple-400 text-xs sm:text-sm">Enriched</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-purple-300">{stats.enriched}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Connection Panel */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Plug className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" aria-hidden="true" />
              Connection
            </h3>

            {crmConfig.connected ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
                  <div>
                    <p className="text-green-300 font-medium text-sm sm:text-base">
                      Connected to {crmConfig.platform === 'hubspot' ? 'HubSpot' : crmConfig.platform === 'salesforce' ? 'Salesforce' : 'Salesgent'}
                    </p>
                    <p className="text-green-400/60 text-xs sm:text-sm">
                      Last sync: {crmConfig.lastSync ? new Date(crmConfig.lastSync).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Auto-sync</span>
                  </div>
                  <button
                    onClick={() => setCrmConfig({ ...crmConfig, autoSync: !crmConfig.autoSync })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      crmConfig.autoSync ? 'bg-indigo-500' : 'bg-gray-600'
                    }`}
                  >
                    <motion.div
                      animate={{ x: crmConfig.autoSync ? 24 : 2 }}
                      className="w-5 h-5 bg-white rounded-full shadow"
                    />
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSyncing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" aria-hidden="true" /> Sync Now
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleEnrich}
                    disabled={isEnriching}
                    className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isEnriching ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Enriching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" aria-hidden="true" /> Enrich Data
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleDisconnect}
                  className="w-full py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">Select your CRM platform to get started</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedPlatform('hubspot')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedPlatform === 'hubspot'
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    aria-label="Select HubSpot CRM"
                    aria-pressed={selectedPlatform === 'hubspot'}
                  >
                    <div className="flex justify-center mb-2">
                      <CircleDot className="w-8 h-8 text-orange-500" aria-hidden="true" />
                    </div>
                    <p className="text-white font-medium">HubSpot</p>
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('salesforce')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedPlatform === 'salesforce'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    aria-label="Select Salesforce CRM"
                    aria-pressed={selectedPlatform === 'salesforce'}
                  >
                    <div className="flex justify-center mb-2">
                      <Database className="w-8 h-8 text-blue-500" aria-hidden="true" />
                    </div>
                    <p className="text-white font-medium">Salesforce</p>
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('salesgent')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedPlatform === 'salesgent'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    aria-label="Select Salesgent CRM"
                    aria-pressed={selectedPlatform === 'salesgent'}
                  >
                    <div className="flex justify-center mb-2">
                      <Shield className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                    </div>
                    <p className="text-white font-medium">Salesgent</p>
                  </button>
                </div>

                {selectedPlatform && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">API Key</label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={`Enter your ${selectedPlatform === 'hubspot' ? 'HubSpot' : selectedPlatform === 'salesforce' ? 'Salesforce' : 'Salesgent'} API key`}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting || !apiKey}
                      className="w-full py-3 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isConnecting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Connecting...
                        </>
                      ) : (
                        'Connect'
                      )}
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>

          {/* Field Mapping */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" aria-hidden="true" /> Field Mapping
            </h3>

            {selectedPlatform || crmConfig.connected ? (
              <div className="space-y-2 max-h-100 overflow-y-auto">
                {getCRMFieldMapping(crmConfig.platform !== 'none' ? crmConfig.platform : selectedPlatform || 'hubspot').map((mapping) => (
                  <div
                    key={mapping.field}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300">{mapping.field}</span>
                      {mapping.required && (
                        <span className="text-xs text-red-400">*</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">→</span>
                      <span className="text-indigo-300 font-mono text-sm">{mapping.crmField}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>Select a CRM platform to view field mappings</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Lead Enrichment Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-white/5 rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" aria-hidden="true" /> Data Enrichment Preview
          </h3>

          <p className="text-gray-400 text-sm mb-4">
            When connected, we automatically enrich your leads with additional company and contact data.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-indigo-300 font-medium mb-2">Company Data</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• Company size</li>
                <li>• Industry classification</li>
                <li>• Annual revenue estimate</li>
                <li>• Website URL</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-purple-300 font-medium mb-2">Contact Data</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• Job title</li>
                <li>• LinkedIn profile</li>
                <li>• Social profiles</li>
                <li>• Decision-maker status</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-pink-300 font-medium mb-2">Lead Intelligence</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• Lead score (auto-calculated)</li>
                <li>• Purchase intent signals</li>
                <li>• Engagement history</li>
                <li>• Best contact time</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Recent Syncs */}
        {crmConfig.connected && allSubmissions.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-white/5 rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" aria-hidden="true" /> Lead Queue
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Name</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Company</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Score</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allSubmissions.slice(0, 5).map((lead) => {
                    const score = calculateLeadScore(lead);
                    return (
                      <tr key={lead.id} className="border-b border-white/5">
                        <td className="py-3 px-4 text-white">
                          {lead.firstName} {lead.lastName}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {lead.businessName || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            score.grade === 'A' ? 'bg-green-500/20 text-green-300' :
                            score.grade === 'B' ? 'bg-blue-500/20 text-blue-300' :
                            score.grade === 'C' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {score.total} ({score.grade})
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {lead.crmSynced ? (
                            <span className="text-green-400 text-sm inline-flex items-center gap-1">
                              <Check className="w-3 h-3" aria-hidden="true" /> Synced
                            </span>
                          ) : (
                            <span className="text-amber-400 text-sm">Pending</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
