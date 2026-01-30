import { BoothMetrics, HourlyData, DemographicData, HeatmapZone, CustomerData, BRANDS, CATEGORIES, BOOTH_SECTIONS, FootTrafficEntry, FootTrafficMetrics, FootTrafficHourlyData } from '../types';
import { calculateLeadScore } from './leadScoring';

export function generateMockMetrics(leads: CustomerData[]): BoothMetrics {
  const uniqueVisitors = leads.length;
  const totalVisitors = uniqueVisitors; // Use actual count, no fake multiplier
  
  // Calculate lead temperatures
  let hotLeads = 0;
  let warmLeads = 0;
  let coldLeads = 0;
  let totalDwell = 0;
  let leadsWithDwell = 0;

  leads.forEach(lead => {
    const score = calculateLeadScore(lead);
    if (score.engagementLevel === 'hot') hotLeads++;
    else if (score.engagementLevel === 'warm') warmLeads++;
    else coldLeads++;
    if (lead.dwellTime && lead.dwellTime > 0) {
      totalDwell += lead.dwellTime;
      leadsWithDwell++;
    }
  });

  const averageDwellTime = leadsWithDwell > 0 ? totalDwell / leadsWithDwell : 0;
  const bounceRate = leads.length > 0 ? Math.max(5, 25 - (hotLeads / leads.length) * 40) : 0;
  const conversionRate = leads.length > 0 ? ((hotLeads + warmLeads) / Math.max(totalVisitors, 1)) * 100 : 0;
  
  // Calculate actual peak hour from timestamps
  const peakHour = calculatePeakHour(leads);

  return {
    totalVisitors,
    uniqueVisitors,
    averageDwellTime,
    bounceRate,
    peakHour,
    conversionRate,
    qualifiedLeads: hotLeads + warmLeads,
    hotLeads,
    warmLeads,
    coldLeads,
  };
}

function calculatePeakHour(leads: CustomerData[]): string {
  if (leads.length === 0) return 'N/A';
  
  const hourCounts: Record<number, number> = {};
  leads.forEach(lead => {
    const hour = new Date(lead.timestamp).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  let maxHour = 12;
  let maxCount = 0;
  Object.entries(hourCounts).forEach(([hour, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxHour = parseInt(hour);
    }
  });
  
  const period = maxHour >= 12 ? 'PM' : 'AM';
  const displayHour = maxHour > 12 ? maxHour - 12 : maxHour === 0 ? 12 : maxHour;
  return `${displayHour}:00 ${period}`;
}

export function generateHourlyData(leads: CustomerData[]): HourlyData[] {
  const hours = [
    '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'
  ];
  const hourMap: Record<string, number> = {
    '9 AM': 9, '10 AM': 10, '11 AM': 11, '12 PM': 12,
    '1 PM': 13, '2 PM': 14, '3 PM': 15, '4 PM': 16, '5 PM': 17
  };

  // Count actual leads per hour from timestamps
  const hourlyLeads: Record<number, CustomerData[]> = {};
  leads.forEach(lead => {
    const hour = new Date(lead.timestamp).getHours();
    if (!hourlyLeads[hour]) hourlyLeads[hour] = [];
    hourlyLeads[hour].push(lead);
  });

  return hours.map((hour) => {
    const hourNum = hourMap[hour];
    const leadsThisHour = hourlyLeads[hourNum] || [];
    const leadCount = leadsThisHour.length;
    
    // Calculate average dwell for this hour
    const dwellTimes = leadsThisHour
      .filter(l => l.dwellTime && l.dwellTime > 0)
      .map(l => l.dwellTime!);
    const avgDwell = dwellTimes.length > 0 
      ? Math.round(dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length)
      : 0;

    return {
      hour,
      visitors: leadCount,
      leads: leadCount,
      avgDwell,
    };
  });
}

export function generateDemographics(leads: CustomerData[]): {
  businessType: DemographicData[];
  categories: DemographicData[];
  brands: DemographicData[];
  contactPreference: DemographicData[];
} {
  const total = leads.length || 1;

  // Business type distribution
  const wholesaleCount = leads.filter(l => l.businessType === 'wholesale').length;
  const retailCount = leads.filter(l => l.businessType === 'retail').length;

  const businessType: DemographicData[] = [
    { category: 'Wholesale', value: wholesaleCount, percentage: (wholesaleCount / total) * 100 },
    { category: 'Retail', value: retailCount, percentage: (retailCount / total) * 100 },
  ];

  // Category interest distribution
  const categories: DemographicData[] = CATEGORIES.map(cat => {
    const count = leads.filter(l => l.selectedCategories.includes(cat.id)).length;
    return {
      category: cat.name,
      value: count,
      percentage: (count / total) * 100,
    };
  }).sort((a, b) => b.value - a.value);

  // Brand interest distribution
  const brands: DemographicData[] = BRANDS.map(brand => {
    const count = leads.filter(l => l.selectedBrands.includes(brand.id)).length;
    return {
      category: brand.name,
      value: count,
      percentage: (count / total) * 100,
    };
  }).sort((a, b) => b.value - a.value);

  // Contact preference distribution
  const contactPrefs = ['email', 'phone', 'text', 'all'];
  const contactNames: Record<string, string> = {
    email: 'Email',
    phone: 'Phone',
    text: 'Text',
    all: 'Any',
  };
  const contactPreference: DemographicData[] = contactPrefs.map(pref => {
    const count = leads.filter(l => l.preferredContact === pref).length;
    return {
      category: contactNames[pref],
      value: count,
      percentage: (count / total) * 100,
    };
  });

  return { businessType, categories, brands, contactPreference };
}

export function generateHeatmapData(leads: CustomerData[]): HeatmapZone[] {
  // Define booth layout zones with positions
  const zonePositions: Record<string, { x: number; y: number; width: number; height: number }> = {
    'entrance': { x: 40, y: 75, width: 20, height: 20 },
    'beri-display': { x: 5, y: 5, width: 28, height: 30 },
    'raz-display': { x: 36, y: 5, width: 28, height: 30 },
    'lost-mary-display': { x: 67, y: 5, width: 28, height: 30 },
    'dinner-lady-display': { x: 5, y: 40, width: 28, height: 30 },
    'one-tank-display': { x: 36, y: 40, width: 28, height: 30 },
    'ryl-display': { x: 67, y: 40, width: 28, height: 30 },
    'demo-station': { x: 5, y: 75, width: 30, height: 20 },
    'consultation': { x: 70, y: 75, width: 25, height: 20 },
    'product-wall': { x: 40, y: 40, width: 20, height: 30 },
  };

  // Count leads per section and calculate real dwell times
  const sectionCounts: Record<string, number> = {};
  const sectionDwellTimes: Record<string, number[]> = {};
  
  leads.forEach(lead => {
    if (lead.boothSection) {
      sectionCounts[lead.boothSection] = (sectionCounts[lead.boothSection] || 0) + 1;
      if (lead.dwellTime && lead.dwellTime > 0) {
        if (!sectionDwellTimes[lead.boothSection]) sectionDwellTimes[lead.boothSection] = [];
        sectionDwellTimes[lead.boothSection].push(lead.dwellTime);
      }
    }
  });

  const totalLeads = leads.length || 1;
  const maxCount = Math.max(...Object.values(sectionCounts), 1);

  return BOOTH_SECTIONS.map(section => {
    const count = sectionCounts[section.id] || 0;
    const position = zonePositions[section.id] || { x: 50, y: 50, width: 20, height: 20 };
    const dwellArr = sectionDwellTimes[section.id] || [];
    const avgDwell = dwellArr.length > 0 
      ? Math.round(dwellArr.reduce((a, b) => a + b, 0) / dwellArr.length)
      : 0;
    
    return {
      id: section.id,
      name: section.name,
      ...position,
      intensity: Math.round((count / maxCount) * 100),
      visitors: count,
      avgDwell,
    };
  });
}

export function calculateTrends(currentMetrics: BoothMetrics, previousMetrics?: BoothMetrics): {
  visitors: { value: number; trend: 'up' | 'down' | 'neutral'; percentage: number };
  dwellTime: { value: number; trend: 'up' | 'down' | 'neutral'; percentage: number };
  bounceRate: { value: number; trend: 'up' | 'down' | 'neutral'; percentage: number };
  conversion: { value: number; trend: 'up' | 'down' | 'neutral'; percentage: number };
} {
  if (!previousMetrics) {
    return {
      visitors: { value: currentMetrics.totalVisitors, trend: 'neutral', percentage: 0 },
      dwellTime: { value: currentMetrics.averageDwellTime, trend: 'neutral', percentage: 0 },
      bounceRate: { value: currentMetrics.bounceRate, trend: 'neutral', percentage: 0 },
      conversion: { value: currentMetrics.conversionRate, trend: 'neutral', percentage: 0 },
    };
  }

  const calcTrend = (current: number, previous: number) => {
    const diff = ((current - previous) / previous) * 100;
    return {
      trend: diff > 2 ? 'up' : diff < -2 ? 'down' : 'neutral' as 'up' | 'down' | 'neutral',
      percentage: Math.abs(diff),
    };
  };

  return {
    visitors: { 
      value: currentMetrics.totalVisitors, 
      ...calcTrend(currentMetrics.totalVisitors, previousMetrics.totalVisitors) 
    },
    dwellTime: { 
      value: currentMetrics.averageDwellTime, 
      ...calcTrend(currentMetrics.averageDwellTime, previousMetrics.averageDwellTime) 
    },
    bounceRate: { 
      value: currentMetrics.bounceRate, 
      ...calcTrend(previousMetrics.bounceRate, currentMetrics.bounceRate) // Inverted - lower is better
    },
    conversion: { 
      value: currentMetrics.conversionRate, 
      ...calcTrend(currentMetrics.conversionRate, previousMetrics.conversionRate) 
    },
  };
}

export function generateVisitorFlow(): { from: string; to: string; count: number }[] {
  return [
    { from: 'Entrance', to: 'Raz Display', count: 45 },
    { from: 'Entrance', to: 'Beri Display', count: 38 },
    { from: 'Entrance', to: 'Product Wall', count: 28 },
    { from: 'Raz Display', to: 'Demo Station', count: 32 },
    { from: 'Beri Display', to: 'Demo Station', count: 24 },
    { from: 'Demo Station', to: 'Consultation', count: 42 },
    { from: 'Product Wall', to: 'Consultation', count: 18 },
    { from: 'Consultation', to: 'Exit (Converted)', count: 35 },
    { from: 'Raz Display', to: 'Exit (Bounced)', count: 12 },
    { from: 'Entrance', to: 'Exit (Bounced)', count: 22 },
  ];
}

// Foot Traffic Analytics
export function calculateFootTrafficMetrics(
  footTrafficEntries: FootTrafficEntry[],
  leads: CustomerData[]
): FootTrafficMetrics {
  const today = new Date().toDateString();
  const todayEntries = footTrafficEntries.filter(
    (entry) => new Date(entry.timestamp).toDateString() === today
  );

  const totalCount = footTrafficEntries.reduce((sum, entry) => sum + entry.count, 0);
  const todayCount = todayEntries.reduce((sum, entry) => sum + entry.count, 0);

  // Calculate hourly data
  const hourlyData = calculateFootTrafficHourlyData(todayEntries);

  // Find peak hour
  const peakHourData = hourlyData.reduce(
    (max, current) => (current.count > max.count ? current : max),
    { hour: 'N/A', hourNum: 0, count: 0, entries: [] }
  );

  // Calculate average per active hour
  const activeHours = hourlyData.filter((h) => h.count > 0);
  const averagePerHour =
    activeHours.length > 0
      ? Math.round(activeHours.reduce((sum, h) => sum + h.count, 0) / activeHours.length)
      : 0;

  // Calculate conversion rate (leads / foot traffic)
  const todayLeads = leads.filter(
    (lead) => new Date(lead.timestamp).toDateString() === today
  ).length;
  const conversionRate = todayCount > 0 ? (todayLeads / todayCount) * 100 : 0;

  return {
    totalCount,
    todayCount,
    peakHour: peakHourData.hour,
    averagePerHour,
    conversionRate,
    hourlyData,
  };
}

export function calculateFootTrafficHourlyData(
  entries: FootTrafficEntry[]
): FootTrafficHourlyData[] {
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

  const hourlyMap: Record<number, FootTrafficEntry[]> = {};
  entries.forEach((entry) => {
    const hour = new Date(entry.timestamp).getHours();
    if (!hourlyMap[hour]) hourlyMap[hour] = [];
    hourlyMap[hour].push(entry);
  });

  return hours.map((h) => ({
    ...h,
    count: hourlyMap[h.hourNum]?.reduce((sum, e) => sum + e.count, 0) || 0,
    entries: hourlyMap[h.hourNum] || [],
  }));
}

export function getFootTrafficBySection(
  entries: FootTrafficEntry[]
): { section: string; count: number; percentage: number }[] {
  const sectionCounts: Record<string, number> = {};
  let totalWithSection = 0;

  entries.forEach((entry) => {
    if (entry.boothSection) {
      sectionCounts[entry.boothSection] =
        (sectionCounts[entry.boothSection] || 0) + entry.count;
      totalWithSection += entry.count;
    }
  });

  return BOOTH_SECTIONS.map((section) => ({
    section: section.name,
    count: sectionCounts[section.id] || 0,
    percentage:
      totalWithSection > 0
        ? Math.round(((sectionCounts[section.id] || 0) / totalWithSection) * 100)
        : 0,
  })).filter((s) => s.count > 0);
}
