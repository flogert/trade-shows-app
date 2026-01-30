import * as XLSX from 'xlsx';
import { CustomerData, FootTrafficEntry, BRANDS, CATEGORIES, BOOTH_SECTIONS, SALESPEOPLE } from '../types';

// Helper function to format dwell time
function formatDwellTime(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function exportToExcel(data: CustomerData[], filename: string = 'trade-show-leads') {
  // Transform data for Excel
  const excelData = data.map((item) => ({
    'ID': item.id,
    'Date': new Date(item.timestamp).toLocaleDateString(),
    'Time': new Date(item.timestamp).toLocaleTimeString(),
    'Dwell Time': formatDwellTime(item.dwellTime),
    'Salesperson': SALESPEOPLE.find((s) => s.id === item.salesperson)?.name || item.salesperson || '',
    'Booth Section': BOOTH_SECTIONS.find((s) => s.id === item.boothSection)?.name || item.boothSection || '',
    'First Name': item.firstName,
    'Last Name': item.lastName,
    'Email': item.email,
    'Phone': item.phone,
    'Business Name': item.businessName,
    'Business Type': item.businessType,
    'Address': item.address,
    'City': item.city,
    'State': item.state,
    'ZIP Code': item.zipCode,
    'Interested Brands': BRANDS
      .filter((b) => item.selectedBrands.includes(b.id))
      .map((b) => b.name)
      .join(', '),
    'Interested Categories': CATEGORIES
      .filter((c) => item.selectedCategories.includes(c.id))
      .map((c) => c.name)
      .join(', '),
    'Preferred Contact': item.preferredContact,
    'Best Time to Contact': item.bestTimeToContact,
    'Notes': item.notes,
    'AI Insights': item.aiInsights || '',
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 20 }, // ID
    { wch: 12 }, // Date
    { wch: 10 }, // Time
    { wch: 10 }, // Dwell Time
    { wch: 16 }, // Salesperson
    { wch: 22 }, // Booth Section
    { wch: 15 }, // First Name
    { wch: 15 }, // Last Name
    { wch: 25 }, // Email
    { wch: 15 }, // Phone
    { wch: 25 }, // Business Name
    { wch: 12 }, // Business Type
    { wch: 30 }, // Address
    { wch: 15 }, // City
    { wch: 15 }, // State
    { wch: 10 }, // ZIP
    { wch: 40 }, // Brands
    { wch: 50 }, // Categories
    { wch: 15 }, // Preferred Contact
    { wch: 20 }, // Best Time
    { wch: 50 }, // Notes
    { wch: 60 }, // AI Insights
  ];
  worksheet['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

  // Generate filename with date
  const date = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}-${date}.xlsx`;

  // Save file
  XLSX.writeFile(workbook, fullFilename);
}

export function generateEmailContent(data: CustomerData[]): string {
  const summaryStats = {
    total: data.length,
    wholesale: data.filter((d) => d.businessType === 'wholesale').length,
    retail: data.filter((d) => d.businessType === 'retail').length,
    brandInterest: BRANDS.map((b) => ({
      name: b.name,
      count: data.filter((d) => d.selectedBrands.includes(b.id)).length,
    })),
    categoryInterest: CATEGORIES.map((c) => ({
      name: c.name,
      count: data.filter((d) => d.selectedCategories.includes(c.id)).length,
    })),
  };

  return `
Trade Show Lead Summary
========================

Total Leads: ${summaryStats.total}
Wholesale: ${summaryStats.wholesale}
Retail: ${summaryStats.retail}

Brand Interest:
${summaryStats.brandInterest.map((b) => `  - ${b.name}: ${b.count} leads`).join('\n')}

Category Interest:
${summaryStats.categoryInterest.map((c) => `  - ${c.name}: ${c.count} leads`).join('\n')}

Lead Details:
${data.map((d, i) => `
${i + 1}. ${d.firstName} ${d.lastName}
  Salesperson: ${SALESPEOPLE.find((s) => s.id === d.salesperson)?.name || d.salesperson || 'N/A'}
  Booth Section: ${BOOTH_SECTIONS.find((s) => s.id === d.boothSection)?.name || d.boothSection || 'N/A'}
   Business: ${d.businessName || 'N/A'} (${d.businessType})
   Email: ${d.email}
   Phone: ${d.phone}
   Brands: ${BRANDS.filter((b) => d.selectedBrands.includes(b.id)).map((b) => b.name).join(', ')}
   Categories: ${CATEGORIES.filter((c) => d.selectedCategories.includes(c.id)).map((c) => c.name).join(', ')}
   Contact Preference: ${d.preferredContact} - ${d.bestTimeToContact}
   Notes: ${d.notes || 'None'}
`).join('\n')}
  `.trim();
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

// Foot Traffic Export
export function exportFootTrafficToExcel(
  footTrafficEntries: FootTrafficEntry[],
  leads: CustomerData[],
  filename: string = 'foot-traffic-report'
) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary
  const today = new Date().toDateString();
  const todayEntries = footTrafficEntries.filter(
    (entry) => new Date(entry.timestamp).toDateString() === today
  );
  const totalToday = todayEntries.reduce((sum, entry) => sum + entry.count, 0);
  const totalAllTime = footTrafficEntries.reduce((sum, entry) => sum + entry.count, 0);
  const todayLeads = leads.filter(
    (lead) => new Date(lead.timestamp).toDateString() === today
  ).length;
  const conversionRate = totalToday > 0 ? ((todayLeads / totalToday) * 100).toFixed(2) : '0';

  // Calculate hourly breakdown
  const hourlyData = calculateHourlyBreakdown(todayEntries);
  const peakHour = hourlyData.reduce(
    (max, curr) => (curr.count > max.count ? curr : max),
    { hour: 'N/A', count: 0 }
  );

  const summaryData = [
    { Metric: 'Report Date', Value: new Date().toLocaleDateString() },
    { Metric: 'Total Foot Traffic (Today)', Value: totalToday },
    { Metric: 'Total Foot Traffic (All Time)', Value: totalAllTime },
    { Metric: 'Leads Captured (Today)', Value: todayLeads },
    { Metric: 'Conversion Rate', Value: `${conversionRate}%` },
    { Metric: 'Peak Hour', Value: peakHour.hour },
    { Metric: 'Peak Hour Count', Value: peakHour.count },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Sheet 2: Hourly Breakdown (Today)
  const hourlySheetData = hourlyData.map((h) => ({
    'Hour': h.hour,
    'Visitor Count': h.count,
    'Percentage': totalToday > 0 ? `${((h.count / totalToday) * 100).toFixed(1)}%` : '0%',
  }));
  
  const hourlySheet = XLSX.utils.json_to_sheet(hourlySheetData);
  hourlySheet['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, hourlySheet, 'Hourly Breakdown');

  // Sheet 3: Detailed Entries
  const detailedData = footTrafficEntries.map((entry) => ({
    'ID': entry.id,
    'Date': new Date(entry.timestamp).toLocaleDateString(),
    'Time': new Date(entry.timestamp).toLocaleTimeString(),
    'Count': entry.count,
    'Booth Section': entry.boothSection
      ? BOOTH_SECTIONS.find((s) => s.id === entry.boothSection)?.name || entry.boothSection
      : 'All Areas',
    'Notes': entry.notes || '',
  }));

  const detailedSheet = XLSX.utils.json_to_sheet(detailedData);
  detailedSheet['!cols'] = [
    { wch: 25 }, // ID
    { wch: 12 }, // Date
    { wch: 12 }, // Time
    { wch: 8 },  // Count
    { wch: 20 }, // Booth Section
    { wch: 40 }, // Notes
  ];
  XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Detailed Entries');

  // Sheet 4: Daily Totals
  const dailyTotals = calculateDailyTotals(footTrafficEntries, leads);
  const dailySheet = XLSX.utils.json_to_sheet(dailyTotals);
  dailySheet['!cols'] = [
    { wch: 12 }, // Date
    { wch: 15 }, // Foot Traffic
    { wch: 12 }, // Leads
    { wch: 15 }, // Conversion Rate
  ];
  XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Totals');

  // Generate filename with date
  const date = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}-${date}.xlsx`;

  // Save file
  XLSX.writeFile(workbook, fullFilename);
}

// Export both leads and foot traffic in one file
export function exportAllDataToExcel(
  leads: CustomerData[],
  footTrafficEntries: FootTrafficEntry[],
  filename: string = 'trade-show-complete-report'
) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Leads
  const leadsData = leads.map((item) => ({
    'ID': item.id,
    'Date': new Date(item.timestamp).toLocaleDateString(),
    'Time': new Date(item.timestamp).toLocaleTimeString(),
    'Dwell Time': formatDwellTime(item.dwellTime),
    'Salesperson': SALESPEOPLE.find((s) => s.id === item.salesperson)?.name || item.salesperson || '',
    'Booth Section': BOOTH_SECTIONS.find((s) => s.id === item.boothSection)?.name || item.boothSection || '',
    'First Name': item.firstName,
    'Last Name': item.lastName,
    'Email': item.email,
    'Phone': item.phone,
    'Business Name': item.businessName,
    'Business Type': item.businessType,
    'Address': item.address,
    'City': item.city,
    'State': item.state,
    'ZIP Code': item.zipCode,
    'Interested Brands': BRANDS
      .filter((b) => item.selectedBrands.includes(b.id))
      .map((b) => b.name)
      .join(', '),
    'Interested Categories': CATEGORIES
      .filter((c) => item.selectedCategories.includes(c.id))
      .map((c) => c.name)
      .join(', '),
    'Preferred Contact': item.preferredContact,
    'Best Time to Contact': item.bestTimeToContact,
    'Notes': item.notes,
    'AI Insights': item.aiInsights || '',
  }));

  const leadsSheet = XLSX.utils.json_to_sheet(leadsData);
  XLSX.utils.book_append_sheet(workbook, leadsSheet, 'Leads');

  // Sheet 2: Foot Traffic Summary
  const today = new Date().toDateString();
  const todayEntries = footTrafficEntries.filter(
    (entry) => new Date(entry.timestamp).toDateString() === today
  );
  const totalToday = todayEntries.reduce((sum, entry) => sum + entry.count, 0);
  const totalAllTime = footTrafficEntries.reduce((sum, entry) => sum + entry.count, 0);
  const todayLeads = leads.filter(
    (lead) => new Date(lead.timestamp).toDateString() === today
  ).length;

  const trafficSummary = [
    { Metric: 'Total Foot Traffic (Today)', Value: totalToday },
    { Metric: 'Total Foot Traffic (All Time)', Value: totalAllTime },
    { Metric: 'Leads Captured (Today)', Value: todayLeads },
    { Metric: 'Leads Captured (All Time)', Value: leads.length },
    { Metric: 'Conversion Rate (Today)', Value: totalToday > 0 ? `${((todayLeads / totalToday) * 100).toFixed(2)}%` : 'N/A' },
    { Metric: 'Conversion Rate (All Time)', Value: totalAllTime > 0 ? `${((leads.length / totalAllTime) * 100).toFixed(2)}%` : 'N/A' },
  ];

  const trafficSummarySheet = XLSX.utils.json_to_sheet(trafficSummary);
  trafficSummarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, trafficSummarySheet, 'Traffic Summary');

  // Sheet 3: Foot Traffic Detailed
  const trafficData = footTrafficEntries.map((entry) => ({
    'ID': entry.id,
    'Date': new Date(entry.timestamp).toLocaleDateString(),
    'Time': new Date(entry.timestamp).toLocaleTimeString(),
    'Count': entry.count,
    'Booth Section': entry.boothSection
      ? BOOTH_SECTIONS.find((s) => s.id === entry.boothSection)?.name || entry.boothSection
      : 'All Areas',
    'Notes': entry.notes || '',
  }));

  const trafficSheet = XLSX.utils.json_to_sheet(trafficData);
  XLSX.utils.book_append_sheet(workbook, trafficSheet, 'Foot Traffic Detail');

  // Sheet 4: Daily Summary
  const dailyTotals = calculateDailyTotals(footTrafficEntries, leads);
  const dailySheet = XLSX.utils.json_to_sheet(dailyTotals);
  XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Summary');

  // Generate filename with date
  const date = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}-${date}.xlsx`;

  // Save file
  XLSX.writeFile(workbook, fullFilename);
}

// Helper: Calculate hourly breakdown
function calculateHourlyBreakdown(entries: FootTrafficEntry[]): { hour: string; count: number }[] {
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
    hour: h.hour,
    count: hourlyMap[h.hourNum] || 0,
  }));
}

// Helper: Calculate daily totals
function calculateDailyTotals(
  footTrafficEntries: FootTrafficEntry[],
  leads: CustomerData[]
): { Date: string; 'Foot Traffic': number; Leads: number; 'Conversion Rate': string }[] {
  const dailyMap: Record<string, { traffic: number; leads: number }> = {};

  // Aggregate foot traffic by day
  footTrafficEntries.forEach((entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString();
    if (!dailyMap[date]) dailyMap[date] = { traffic: 0, leads: 0 };
    dailyMap[date].traffic += entry.count;
  });

  // Aggregate leads by day
  leads.forEach((lead) => {
    const date = new Date(lead.timestamp).toLocaleDateString();
    if (!dailyMap[date]) dailyMap[date] = { traffic: 0, leads: 0 };
    dailyMap[date].leads += 1;
  });

  // Sort by date and format
  return Object.entries(dailyMap)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([date, data]) => ({
      'Date': date,
      'Foot Traffic': data.traffic,
      'Leads': data.leads,
      'Conversion Rate': data.traffic > 0
        ? `${((data.leads / data.traffic) * 100).toFixed(2)}%`
        : 'N/A',
    }));
}
