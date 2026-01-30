import { CustomerData, CRMConfig, EnrichedLeadData } from '../types';
import { enrichLeadData } from './leadScoring';

export interface CRMSyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
  syncedLeads: string[];
}

export interface CRMConnectionStatus {
  connected: boolean;
  platform: string;
  lastSync: string | null;
  totalSynced: number;
  pendingSync: number;
}

// Simulate CRM API connections
export async function connectToCRM(
  platform: 'hubspot' | 'salesforce' | 'salesgent',
  apiKey: string
): Promise<{ success: boolean; message: string }> {
  // Simulate API connection delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate validation
  if (apiKey.length < 10) {
    return { success: false, message: 'Invalid API key format' };
  }

  // Mock successful connection
  return { 
    success: true, 
    message: `Successfully connected to ${platform === 'hubspot' ? 'HubSpot' : platform === 'salesforce' ? 'Salesforce' : 'Salesgent'}` 
  };
}

export async function syncLeadsToCRM(
  leads: CustomerData[],
  config: CRMConfig
): Promise<CRMSyncResult> {
  // Simulate sync delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (!config.connected) {
    return {
      success: false,
      syncedCount: 0,
      failedCount: leads.length,
      errors: ['CRM not connected'],
      syncedLeads: [],
    };
  }

  // Simulate sync with some random failures for realism
  const syncedLeads: string[] = [];
  const errors: string[] = [];
  
  leads.forEach(lead => {
    if (Math.random() > 0.05) { // 95% success rate
      syncedLeads.push(lead.id);
    } else {
      errors.push(`Failed to sync ${lead.firstName} ${lead.lastName}: Network timeout`);
    }
  });

  return {
    success: errors.length === 0,
    syncedCount: syncedLeads.length,
    failedCount: errors.length,
    errors,
    syncedLeads,
  };
}

export async function enrichLeadsFromCRM(
  leads: CustomerData[],
  config: CRMConfig
): Promise<Map<string, EnrichedLeadData>> {
  // Simulate enrichment delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const enrichedMap = new Map<string, EnrichedLeadData>();

  if (!config.connected) {
    return enrichedMap;
  }

  leads.forEach(lead => {
    const enriched = enrichLeadData(lead);
    enrichedMap.set(lead.id, enriched);
  });

  return enrichedMap;
}

export function getCRMFieldMapping(platform: 'hubspot' | 'salesforce' | 'salesgent'): {
  field: string;
  crmField: string;
  required: boolean;
}[] {
  const baseMapping = [
    {
      field: 'firstName',
      crmField: platform === 'hubspot' ? 'firstname' : platform === 'salesforce' ? 'FirstName' : 'first_name',
      required: true,
    },
    {
      field: 'lastName',
      crmField: platform === 'hubspot' ? 'lastname' : platform === 'salesforce' ? 'LastName' : 'last_name',
      required: true,
    },
    {
      field: 'email',
      crmField: platform === 'hubspot' ? 'email' : platform === 'salesforce' ? 'Email' : 'email',
      required: true,
    },
    {
      field: 'phone',
      crmField: platform === 'hubspot' ? 'phone' : platform === 'salesforce' ? 'Phone' : 'phone',
      required: false,
    },
    {
      field: 'businessName',
      crmField: platform === 'hubspot' ? 'company' : platform === 'salesforce' ? 'Company' : 'company',
      required: false,
    },
    {
      field: 'businessType',
      crmField: platform === 'hubspot' ? 'lead_type' : platform === 'salesforce' ? 'Type' : 'business_type',
      required: false,
    },
    {
      field: 'address',
      crmField: platform === 'hubspot' ? 'address' : platform === 'salesforce' ? 'Street' : 'address',
      required: false,
    },
    {
      field: 'city',
      crmField: platform === 'hubspot' ? 'city' : platform === 'salesforce' ? 'City' : 'city',
      required: false,
    },
    {
      field: 'state',
      crmField: platform === 'hubspot' ? 'state' : platform === 'salesforce' ? 'State' : 'state',
      required: false,
    },
    {
      field: 'zipCode',
      crmField: platform === 'hubspot' ? 'zip' : platform === 'salesforce' ? 'PostalCode' : 'zip',
      required: false,
    },
    {
      field: 'leadScore',
      crmField: platform === 'hubspot' ? 'lead_score' : platform === 'salesforce' ? 'Lead_Score__c' : 'lead_score',
      required: false,
    },
    {
      field: 'notes',
      crmField: platform === 'hubspot' ? 'notes' : platform === 'salesforce' ? 'Description' : 'notes',
      required: false,
    },
  ];

  return baseMapping;
}

export function generateCRMStats(leads: CustomerData[]): {
  totalLeads: number;
  synced: number;
  pending: number;
  enriched: number;
  hubspotCount: number;
  salesforceCount: number;
  salesgentCount: number;
} {
  const synced = leads.filter(l => l.crmSynced).length;
  const enriched = leads.filter(l => l.enrichedData).length;
  const hubspotCount = leads.filter(l => l.crmPlatform === 'hubspot').length;
  const salesforceCount = leads.filter(l => l.crmPlatform === 'salesforce').length;
  const salesgentCount = leads.filter(l => l.crmPlatform === 'salesgent').length;

  return {
    totalLeads: leads.length,
    synced,
    pending: leads.length - synced,
    enriched,
    hubspotCount,
    salesforceCount,
    salesgentCount,
  };
}

// GDPR Compliance helpers
export function generateGDPRConsent(): {
  dataCollection: boolean;
  marketing: boolean;
  thirdPartySharing: boolean;
  timestamp: string;
} {
  return {
    dataCollection: true,
    marketing: false,
    thirdPartySharing: false,
    timestamp: new Date().toISOString(),
  };
}

export function anonymizeLeadData(lead: CustomerData): Partial<CustomerData> {
  return {
    ...lead,
    firstName: '***',
    lastName: '***',
    email: lead.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
    phone: lead.phone.replace(/(\d{3}).*(\d{2})$/, '$1-***-**$2'),
    address: '***',
  };
}
