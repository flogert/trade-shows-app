import * as XLSX from 'xlsx-js-style';
import { CustomerData, FootTrafficEntry, BRANDS, CATEGORIES, BOOTH_SECTIONS, SALESPEOPLE } from '../types';
import {
  calculateFootTrafficMetrics,
  generateDemographics,
  generateHeatmapData,
  generateHourlyData,
  generateMockMetrics,
} from './analytics';

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

const HEADER_STYLE = {
  font: { bold: true, color: { rgb: 'FFFFFF' } },
  fill: { fgColor: { rgb: '1F4E78' } },
  alignment: { horizontal: 'center', vertical: 'center' },
};

const TITLE_STYLE = {
  font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 14 },
  fill: { fgColor: { rgb: '1A365D' } },
  alignment: { horizontal: 'left', vertical: 'center' },
};

const LABEL_STYLE = {
  font: { bold: true, color: { rgb: '0F172A' } },
  fill: { fgColor: { rgb: 'E2E8F0' } },
  alignment: { horizontal: 'left', vertical: 'center' },
};

type StyledCell = XLSX.CellObject & { s?: unknown };

function styleHeaderRow(worksheet: XLSX.WorkSheet): void {
  if (!worksheet['!ref']) return;

  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let col = range.s.c; col <= range.e.c; col += 1) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    const cell = worksheet[cellAddress] as (XLSX.CellObject & { s?: unknown }) | undefined;
    if (cell) {
      cell.s = HEADER_STYLE;
    }
  }
}

function styleRow(worksheet: XLSX.WorkSheet, rowIndex: number): void {
  if (!worksheet['!ref']) return;

  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let col = range.s.c; col <= range.e.c; col += 1) {
    const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: col });
    const cell = worksheet[cellAddress] as StyledCell | undefined;
    if (cell) {
      cell.s = HEADER_STYLE;
    }
  }
}

function applyCellStyle(worksheet: XLSX.WorkSheet, row: number, col: number, style: unknown): void {
  const address = XLSX.utils.encode_cell({ r: row, c: col });
  const cell = worksheet[address] as StyledCell | undefined;
  if (cell) {
    cell.s = style;
  }
}

function formatSeconds(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m 0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function intensityColor(intensity: number): string {
  if (intensity >= 80) return 'EF4444';
  if (intensity >= 60) return 'F97316';
  if (intensity >= 40) return 'EAB308';
  if (intensity >= 20) return '22C55E';
  return '94A3B8';
}

function appendDashboardAnalyticsSheets(
  workbook: XLSX.WorkBook,
  leads: CustomerData[],
  footTrafficEntries: FootTrafficEntry[]
): void {
  const metrics = generateMockMetrics(leads);
  const hourlyData = generateHourlyData(leads);
  const demographics = generateDemographics(leads);
  const heatmapData = generateHeatmapData(leads);
  const footTrafficMetrics = calculateFootTrafficMetrics(footTrafficEntries, leads);

  const kpiRows = [
    {
      Section: 'Lead Performance',
      Metric: 'Total Visitors',
      Value: metrics.totalVisitors,
      Display: metrics.totalVisitors.toLocaleString(),
    },
    {
      Section: 'Lead Performance',
      Metric: 'Unique Visitors',
      Value: metrics.uniqueVisitors,
      Display: metrics.uniqueVisitors.toLocaleString(),
    },
    {
      Section: 'Lead Performance',
      Metric: 'Avg Dwell Time',
      Value: Math.round(metrics.averageDwellTime),
      Display: formatSeconds(Math.round(metrics.averageDwellTime)),
    },
    {
      Section: 'Lead Performance',
      Metric: 'Bounce Rate',
      Value: Number(metrics.bounceRate.toFixed(1)),
      Display: `${metrics.bounceRate.toFixed(1)}%`,
    },
    {
      Section: 'Lead Performance',
      Metric: 'Conversion Rate',
      Value: Number(metrics.conversionRate.toFixed(1)),
      Display: `${metrics.conversionRate.toFixed(1)}%`,
    },
    {
      Section: 'Foot Traffic',
      Metric: 'Visitors Today',
      Value: footTrafficMetrics.todayCount,
      Display: footTrafficMetrics.todayCount.toLocaleString(),
    },
    {
      Section: 'Foot Traffic',
      Metric: 'Visitors All Time',
      Value: footTrafficMetrics.totalCount,
      Display: footTrafficMetrics.totalCount.toLocaleString(),
    },
    {
      Section: 'Foot Traffic',
      Metric: 'Peak Hour',
      Value: 0,
      Display: footTrafficMetrics.peakHour,
    },
    {
      Section: 'Foot Traffic',
      Metric: 'Avg Visitors / Hour',
      Value: footTrafficMetrics.averagePerHour,
      Display: footTrafficMetrics.averagePerHour.toString(),
    },
    {
      Section: 'Foot Traffic',
      Metric: 'Lead Conversion',
      Value: Number(footTrafficMetrics.conversionRate.toFixed(1)),
      Display: `${footTrafficMetrics.conversionRate.toFixed(1)}%`,
    },
    {
      Section: 'Lead Temperature',
      Metric: 'Hot Leads',
      Value: metrics.hotLeads,
      Display: metrics.hotLeads.toString(),
    },
    {
      Section: 'Lead Temperature',
      Metric: 'Warm Leads',
      Value: metrics.warmLeads,
      Display: metrics.warmLeads.toString(),
    },
    {
      Section: 'Lead Temperature',
      Metric: 'Cold Leads',
      Value: metrics.coldLeads,
      Display: metrics.coldLeads.toString(),
    },
  ];

  const kpiSheet = XLSX.utils.aoa_to_sheet([
    ['Trade Show Analytics Dashboard'],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
  ]);
  kpiSheet['!cols'] = [
    { wch: 18 },
    { wch: 22 },
    { wch: 10 },
    { wch: 20 },
  ];
  kpiSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
  ];
  applyCellStyle(kpiSheet, 0, 0, TITLE_STYLE);
  applyCellStyle(kpiSheet, 1, 0, LABEL_STYLE);

  // Move table headers to row 4 so the sheet starts with a dashboard-style summary block.
  XLSX.utils.sheet_add_json(kpiSheet, kpiRows, { origin: 'A4', skipHeader: false });
  styleRow(kpiSheet, 3);
  XLSX.utils.book_append_sheet(workbook, kpiSheet, 'Dashboard KPIs');

  const footTrafficByHour = new Map(footTrafficMetrics.hourlyData.map((item) => [item.hour, item.count]));
  const hourlyRows = hourlyData.map((item) => ({
    Hour: item.hour,
    Visitors: item.visitors,
    Leads: item.leads,
    'Avg Dwell': formatSeconds(item.avgDwell),
    'Foot Traffic': footTrafficByHour.get(item.hour) || 0,
  }));

  const hourlySheet = XLSX.utils.json_to_sheet(hourlyRows);
  hourlySheet['!cols'] = [
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 14 },
    { wch: 12 },
  ];
  styleHeaderRow(hourlySheet);
  XLSX.utils.book_append_sheet(workbook, hourlySheet, 'Hourly Analytics');

  const brandRows = demographics.brands.map((item) => ({
    Brand: item.category,
    Leads: item.value,
    Percentage: `${item.percentage.toFixed(1)}%`,
  }));

  const brandSheet = XLSX.utils.json_to_sheet(brandRows);
  brandSheet['!cols'] = [{ wch: 22 }, { wch: 10 }, { wch: 12 }];
  styleHeaderRow(brandSheet);
  XLSX.utils.book_append_sheet(workbook, brandSheet, 'Brand Interest');

  const categoryRows = demographics.categories.map((item) => ({
    Category: item.category,
    Leads: item.value,
    Percentage: `${item.percentage.toFixed(1)}%`,
  }));

  const categorySheet = XLSX.utils.json_to_sheet(categoryRows);
  categorySheet['!cols'] = [{ wch: 30 }, { wch: 10 }, { wch: 12 }];
  styleHeaderRow(categorySheet);
  XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Interest');

  const businessTypeRows = demographics.businessType.map((item) => ({
    Type: item.category,
    Leads: item.value,
    Percentage: `${item.percentage.toFixed(1)}%`,
  }));

  const businessTypeSheet = XLSX.utils.json_to_sheet(businessTypeRows);
  businessTypeSheet['!cols'] = [{ wch: 18 }, { wch: 10 }, { wch: 12 }];
  styleHeaderRow(businessTypeSheet);
  XLSX.utils.book_append_sheet(workbook, businessTypeSheet, 'Business Type');

  const sortedZones = [...heatmapData].sort((a, b) => b.intensity - a.intensity);
  const heatmapRows = sortedZones.map((zone) => ({
    Zone: zone.name,
    Visitors: zone.visitors,
    'Avg Dwell': formatSeconds(zone.avgDwell),
    Intensity: `${zone.intensity}%`,
  }));

  const heatmapSheet = XLSX.utils.json_to_sheet(heatmapRows);
  heatmapSheet['!cols'] = [{ wch: 24 }, { wch: 10 }, { wch: 14 }, { wch: 12 }];
  styleHeaderRow(heatmapSheet);

  // Colorize intensity cells to mirror heatmap severity.
  sortedZones.forEach((zone, index) => {
    applyCellStyle(heatmapSheet, index + 1, 3, {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: intensityColor(zone.intensity) } },
      alignment: { horizontal: 'center', vertical: 'center' },
    });
  });

  XLSX.utils.book_append_sheet(workbook, heatmapSheet, 'Booth Heatmap');
}

function sortLeadsForExport(leads: CustomerData[]): CustomerData[] {
  return [...leads].sort((a, b) => {
    const lastNameCompare = (a.lastName || '').localeCompare(b.lastName || '');
    if (lastNameCompare !== 0) return lastNameCompare;

    const firstNameCompare = (a.firstName || '').localeCompare(b.firstName || '');
    if (firstNameCompare !== 0) return firstNameCompare;

    const businessNameCompare = (a.businessName || '').localeCompare(b.businessName || '');
    if (businessNameCompare !== 0) return businessNameCompare;

    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });
}

function getVisitorTotals(entries: FootTrafficEntry[]): { totalAllTime: number; totalToday: number } {
  const today = new Date().toDateString();
  const totalToday = entries
    .filter((entry) => new Date(entry.timestamp).toDateString() === today)
    .reduce((sum, entry) => sum + entry.count, 0);
  const totalAllTime = entries.reduce((sum, entry) => sum + entry.count, 0);

  return { totalAllTime, totalToday };
}

function mapLeadForExport(item: CustomerData, totalVisitorsAllTime: number): Record<string, string | number> {
  return {
    'First Name': item.firstName,
    'Last Name': item.lastName,
    'Business Name': item.businessName,
    'Business Type': item.businessType,
    'Email': item.email,
    'Phone': item.phone,
    'Salesperson': SALESPEOPLE.find((s) => s.id === item.salesperson)?.name || item.salesperson || '',
    'Booth Section': BOOTH_SECTIONS.find((s) => s.id === item.boothSection)?.name || item.boothSection || '',
    'Date': new Date(item.timestamp).toLocaleDateString(),
    'Time': new Date(item.timestamp).toLocaleTimeString(),
    'Dwell Time': formatDwellTime(item.dwellTime),
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
    'Visitors Counted (All Time)': totalVisitorsAllTime,
    'Notes': item.notes,
    'AI Insights': item.aiInsights || '',
    'ID': item.id,
  };
}

export function exportToExcel(
  data: CustomerData[],
  filename: string = 'trade-show-leads',
  footTrafficEntries: FootTrafficEntry[] = []
) {
  const { totalAllTime, totalToday } = getVisitorTotals(footTrafficEntries);

  const summaryData = [
    { Metric: 'Report Date', Value: new Date().toLocaleDateString() },
    { Metric: 'Leads Exported', Value: data.length },
    { Metric: 'Visitors Counted (Today)', Value: totalToday },
    { Metric: 'Visitors Counted (All Time)', Value: totalAllTime },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 24 }];
  styleHeaderRow(summarySheet);

  // Transform and sort lead data for cleaner exports.
  const excelData = sortLeadsForExport(data).map((item) => mapLeadForExport(item, totalAllTime));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 15 }, // First Name
    { wch: 15 }, // Last Name
    { wch: 25 }, // Business Name
    { wch: 14 }, // Business Type
    { wch: 25 }, // Email
    { wch: 15 }, // Phone
    { wch: 16 }, // Salesperson
    { wch: 22 }, // Booth Section
    { wch: 12 }, // Date
    { wch: 12 }, // Time
    { wch: 12 }, // Dwell Time
    { wch: 30 }, // Address
    { wch: 15 }, // City
    { wch: 15 }, // State
    { wch: 10 }, // ZIP
    { wch: 40 }, // Brands
    { wch: 50 }, // Categories
    { wch: 15 }, // Preferred Contact
    { wch: 20 }, // Best Time
    { wch: 24 }, // Visitors Counted (All Time)
    { wch: 50 }, // Notes
    { wch: 60 }, // AI Insights
    { wch: 22 }, // ID
  ];
  worksheet['!cols'] = colWidths;
  styleHeaderRow(worksheet);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  appendDashboardAnalyticsSheets(workbook, data, footTrafficEntries);

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
  styleHeaderRow(summarySheet);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Sheet 2: Hourly Breakdown (Today)
  const hourlySheetData = hourlyData.map((h) => ({
    'Hour': h.hour,
    'Visitor Count': h.count,
    'Percentage': totalToday > 0 ? `${((h.count / totalToday) * 100).toFixed(1)}%` : '0%',
  }));
  
  const hourlySheet = XLSX.utils.json_to_sheet(hourlySheetData);
  hourlySheet['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 12 }];
  styleHeaderRow(hourlySheet);
  XLSX.utils.book_append_sheet(workbook, hourlySheet, 'Hourly Breakdown');

  // Sheet 3: Detailed Entries
  const detailedData = [...footTrafficEntries]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((entry) => ({
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
  styleHeaderRow(detailedSheet);
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
  styleHeaderRow(dailySheet);
  XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Totals');
  appendDashboardAnalyticsSheets(workbook, leads, footTrafficEntries);

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
  const { totalAllTime } = getVisitorTotals(footTrafficEntries);

  // Sheet 1: Leads
  const leadsData = sortLeadsForExport(leads).map((item) => mapLeadForExport(item, totalAllTime));

  const leadsSheet = XLSX.utils.json_to_sheet(leadsData);
  leadsSheet['!cols'] = [
    { wch: 15 }, // First Name
    { wch: 15 }, // Last Name
    { wch: 25 }, // Business Name
    { wch: 14 }, // Business Type
    { wch: 25 }, // Email
    { wch: 15 }, // Phone
    { wch: 16 }, // Salesperson
    { wch: 22 }, // Booth Section
    { wch: 12 }, // Date
    { wch: 12 }, // Time
    { wch: 12 }, // Dwell Time
    { wch: 30 }, // Address
    { wch: 15 }, // City
    { wch: 15 }, // State
    { wch: 10 }, // ZIP
    { wch: 40 }, // Brands
    { wch: 50 }, // Categories
    { wch: 15 }, // Preferred Contact
    { wch: 20 }, // Best Time
    { wch: 24 }, // Visitors Counted (All Time)
    { wch: 50 }, // Notes
    { wch: 60 }, // AI Insights
    { wch: 22 }, // ID
  ];
  styleHeaderRow(leadsSheet);
  XLSX.utils.book_append_sheet(workbook, leadsSheet, 'Leads');

  // Sheet 2: Foot Traffic Summary
  const today = new Date().toDateString();
  const todayEntries = footTrafficEntries.filter(
    (entry) => new Date(entry.timestamp).toDateString() === today
  );
  const totalToday = todayEntries.reduce((sum, entry) => sum + entry.count, 0);
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
  styleHeaderRow(trafficSummarySheet);
  XLSX.utils.book_append_sheet(workbook, trafficSummarySheet, 'Traffic Summary');

  // Sheet 3: Foot Traffic Detailed
  const trafficData = [...footTrafficEntries]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((entry) => ({
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
  trafficSheet['!cols'] = [
    { wch: 25 }, // ID
    { wch: 12 }, // Date
    { wch: 12 }, // Time
    { wch: 10 }, // Count
    { wch: 20 }, // Booth Section
    { wch: 40 }, // Notes
  ];
  styleHeaderRow(trafficSheet);
  XLSX.utils.book_append_sheet(workbook, trafficSheet, 'Foot Traffic Detail');

  // Sheet 4: Daily Summary
  const dailyTotals = calculateDailyTotals(footTrafficEntries, leads);
  const dailySheet = XLSX.utils.json_to_sheet(dailyTotals);
  dailySheet['!cols'] = [
    { wch: 12 }, // Date
    { wch: 15 }, // Foot Traffic
    { wch: 12 }, // Leads
    { wch: 15 }, // Conversion Rate
  ];
  styleHeaderRow(dailySheet);
  XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Summary');
  appendDashboardAnalyticsSheets(workbook, leads, footTrafficEntries);

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
