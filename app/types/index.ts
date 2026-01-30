export interface CustomerData {
  id: string;
  timestamp: string;
  
  // Booth & Staff Info
  boothSection: string;
  salesperson: string;
  
  // Contact Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: 'wholesale' | 'retail' | '';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Product Interests
  selectedBrands: string[];
  selectedCategories: string[];
  
  // Contact Preferences
  preferredContact: 'email' | 'phone' | 'text' | 'all' | '';
  bestTimeToContact: string;
  
  // Additional Notes
  notes: string;
  
  // Order Tracking
  placedOrder: boolean;
  orderNotes?: string;
  
  // AI Generated
  aiInsights?: string;

  // Lead Scoring & Analytics
  leadScore?: number;
  leadGrade?: 'A' | 'B' | 'C' | 'D';
  engagementLevel?: 'hot' | 'warm' | 'cold';
  dwellTime?: number; // seconds spent at booth
  visitCount?: number;
  lastVisit?: string;
  
  // CRM Integration
  crmSynced?: boolean;
  crmId?: string;
  crmPlatform?: 'hubspot' | 'salesforce' | 'salesgent' | 'none';
  enrichedData?: EnrichedLeadData;
}

export interface EnrichedLeadData {
  companySize?: string;
  industry?: string;
  annualRevenue?: string;
  linkedInUrl?: string;
  websiteUrl?: string;
  jobTitle?: string;
  companyDescription?: string;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface BoothMetrics {
  totalVisitors: number;
  uniqueVisitors: number;
  averageDwellTime: number;
  bounceRate: number;
  peakHour: string;
  conversionRate: number;
  qualifiedLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
}

export interface HourlyData {
  hour: string;
  visitors: number;
  leads: number;
  avgDwell: number;
}

export interface DemographicData {
  category: string;
  value: number;
  percentage: number;
}

export interface HeatmapZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number; // 0-100
  visitors: number;
  avgDwell: number;
}

export interface CRMConfig {
  platform: 'hubspot' | 'salesforce' | 'salesgent' | 'none';
  apiKey?: string;
  connected: boolean;
  lastSync?: string;
  autoSync: boolean;
  syncInterval: number; // minutes
}

export const BRANDS = [
  { id: 'beri', name: 'Beri', color: '#6366f1' },
  { id: 'raz', name: 'Raz', color: '#ec4899' },
  { id: 'lost-mary', name: 'Lost Mary', color: '#8b5cf6' },
  { id: 'dinner-lady', name: 'Dinner Lady', color: '#f59e0b' },
  { id: 'one-tank', name: 'One Tank', color: '#10b981' },
  { id: 'ryl', name: 'RYL', color: '#ef4444' },
] as const;

export const CATEGORIES = [
  { id: 'vapes', name: 'Vapes', description: 'Disposable and rechargeable vape devices' },
  { id: 'devices', name: 'Devices', description: 'Mods, pods, and starter kits' },
  { id: 'vape-juice', name: 'Vape Juice', description: 'E-liquids and nicotine salts' },
  { id: 'smoke-shop', name: 'Smoke Shop Items', description: 'Papers, pipes, and accessories' },
  { id: 'hemp', name: 'Hemp Products', description: 'CBD, Delta-8, and hemp extracts' },
  { id: 'convenience', name: 'Convenience Store Items', description: 'Snacks, drinks, and essentials' },
] as const;

export const CONTACT_METHODS = [
  { id: 'email', name: 'Email' },
  { id: 'phone', name: 'Phone Call' },
  { id: 'text', name: 'Text Message' },
  { id: 'all', name: 'Any Method' },
] as const;

export const BUSINESS_TYPES = [
  { id: 'wholesale', name: 'Wholesale', description: 'Bulk orders for resale' },
  { id: 'retail', name: 'Retail', description: 'Individual store purchases' },
] as const;

export const BOOTH_SECTIONS = [
  { id: 'beri-display', name: 'Beri Display' },
  { id: 'dinner-lady-display', name: 'Dinner Lady Display' },
  { id: 'lost-mary-display', name: 'Lost Mary Display' },
  { id: 'one-tank-display', name: 'One Tank Display' },
  { id: 'raz-display', name: 'Raz Display' },
  { id: 'ryl-display', name: 'RYL Display' },
] as const;

export const SALESPEOPLE = [
  { id: 'amanda', name: 'Amanda' },
  { id: 'bella', name: 'Bella' },
  { id: 'brandon', name: 'Brandon' },
  { id: 'dani', name: 'Dani' },
  { id: 'james', name: 'James' },
  { id: 'tisha', name: 'Tisha' },
] as const;

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Colorado', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
] as const;

// Foot Traffic Tracking
export interface FootTrafficEntry {
  id: string;
  timestamp: string;
  count: number;
  boothSection?: string;
  notes?: string;
}

export interface FootTrafficHourlyData {
  hour: string;
  hourNum: number;
  count: number;
  entries: FootTrafficEntry[];
}

export interface FootTrafficMetrics {
  totalCount: number;
  todayCount: number;
  peakHour: string;
  averagePerHour: number;
  conversionRate: number; // leads / foot traffic
  hourlyData: FootTrafficHourlyData[];
}
