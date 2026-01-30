import { CustomerData, BRANDS, CATEGORIES, EnrichedLeadData } from '../types';

export interface LeadScoreBreakdown {
  total: number;
  grade: 'A' | 'B' | 'C' | 'D';
  engagementLevel: 'hot' | 'warm' | 'cold';
  factors: {
    name: string;
    points: number;
    maxPoints: number;
    description: string;
  }[];
}

export function calculateLeadScore(lead: CustomerData): LeadScoreBreakdown {
  const factors: LeadScoreBreakdown['factors'] = [];
  let totalScore = 0;

  // Business Type (max 15 points)
  const businessTypeScore = lead.businessType === 'wholesale' ? 15 : lead.businessType === 'retail' ? 10 : 0;
  factors.push({
    name: 'Business Type',
    points: businessTypeScore,
    maxPoints: 15,
    description: lead.businessType === 'wholesale' ? 'High-value wholesale buyer' : 'Retail customer',
  });
  totalScore += businessTypeScore;

  // Contact Completeness (max 20 points)
  let contactScore = 0;
  if (lead.email) contactScore += 5;
  if (lead.phone) contactScore += 5;
  if (lead.businessName) contactScore += 5;
  if (lead.address && lead.city && lead.state) contactScore += 5;
  factors.push({
    name: 'Contact Completeness',
    points: contactScore,
    maxPoints: 20,
    description: `${contactScore / 5} of 4 contact fields completed`,
  });
  totalScore += contactScore;

  // Brand Interest (max 20 points)
  const brandScore = Math.min(lead.selectedBrands.length * 4, 20);
  factors.push({
    name: 'Brand Interest',
    points: brandScore,
    maxPoints: 20,
    description: `Interested in ${lead.selectedBrands.length} brands`,
  });
  totalScore += brandScore;

  // Category Interest (max 20 points)
  const categoryScore = Math.min(lead.selectedCategories.length * 4, 20);
  factors.push({
    name: 'Category Interest',
    points: categoryScore,
    maxPoints: 20,
    description: `Interested in ${lead.selectedCategories.length} categories`,
  });
  totalScore += categoryScore;

  // Engagement Level (max 15 points)
  const dwellScore = lead.dwellTime 
    ? Math.min(Math.floor(lead.dwellTime / 60) * 3, 15) 
    : 5; // Default 5 if no tracking
  factors.push({
    name: 'Booth Engagement',
    points: dwellScore,
    maxPoints: 15,
    description: lead.dwellTime 
      ? `${Math.floor(lead.dwellTime / 60)} minutes at booth` 
      : 'Standard engagement',
  });
  totalScore += dwellScore;

  // Notes & Intent (max 10 points)
  const notesScore = lead.notes 
    ? Math.min(Math.floor(lead.notes.length / 20), 10) 
    : 0;
  factors.push({
    name: 'Expressed Intent',
    points: notesScore,
    maxPoints: 10,
    description: lead.notes ? 'Provided detailed requirements' : 'No specific requirements noted',
  });
  totalScore += notesScore;

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D';
  if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 60) grade = 'B';
  else if (totalScore >= 40) grade = 'C';
  else grade = 'D';

  // Determine engagement level
  let engagementLevel: 'hot' | 'warm' | 'cold';
  if (totalScore >= 70) engagementLevel = 'hot';
  else if (totalScore >= 45) engagementLevel = 'warm';
  else engagementLevel = 'cold';

  return {
    total: totalScore,
    grade,
    engagementLevel,
    factors,
  };
}

export function enrichLeadData(lead: CustomerData): EnrichedLeadData {
  // Simulate CRM data enrichment
  // In production, this would call actual CRM APIs
  const enriched: EnrichedLeadData = {};

  if (lead.businessName) {
    // Simulate company data lookup
    const companySizes = ['1-10', '11-50', '51-200', '201-500', '500+'];
    const industries = ['Retail', 'Distribution', 'Convenience Stores', 'Smoke Shops', 'Vape Shops'];
    const revenues = ['<$100K', '$100K-$500K', '$500K-$1M', '$1M-$5M', '$5M+'];

    enriched.companySize = companySizes[Math.floor(Math.random() * companySizes.length)];
    enriched.industry = industries[Math.floor(Math.random() * industries.length)];
    enriched.annualRevenue = lead.businessType === 'wholesale' 
      ? revenues[Math.floor(Math.random() * 2) + 2] // Higher revenue for wholesale
      : revenues[Math.floor(Math.random() * 3)];
    enriched.websiteUrl = `https://${lead.businessName.toLowerCase().replace(/\s+/g, '')}.com`;
  }

  if (lead.firstName && lead.lastName) {
    enriched.linkedInUrl = `https://linkedin.com/in/${lead.firstName.toLowerCase()}-${lead.lastName.toLowerCase()}`;
    enriched.jobTitle = lead.businessType === 'wholesale' ? 'Purchasing Manager' : 'Store Owner';
  }

  return enriched;
}

export function segmentLeads(leads: CustomerData[]): {
  hot: CustomerData[];
  warm: CustomerData[];
  cold: CustomerData[];
  byGrade: Record<string, CustomerData[]>;
  byBusinessType: Record<string, CustomerData[]>;
  byCategory: Record<string, CustomerData[]>;
  byBrand: Record<string, CustomerData[]>;
} {
  const hot: CustomerData[] = [];
  const warm: CustomerData[] = [];
  const cold: CustomerData[] = [];
  const byGrade: Record<string, CustomerData[]> = { A: [], B: [], C: [], D: [] };
  const byBusinessType: Record<string, CustomerData[]> = { wholesale: [], retail: [] };
  const byCategory: Record<string, CustomerData[]> = {};
  const byBrand: Record<string, CustomerData[]> = {};

  // Initialize category and brand buckets
  CATEGORIES.forEach(cat => byCategory[cat.id] = []);
  BRANDS.forEach(brand => byBrand[brand.id] = []);

  leads.forEach(lead => {
    const score = calculateLeadScore(lead);
    
    // Segment by engagement
    if (score.engagementLevel === 'hot') hot.push(lead);
    else if (score.engagementLevel === 'warm') warm.push(lead);
    else cold.push(lead);

    // Segment by grade
    byGrade[score.grade].push(lead);

    // Segment by business type
    if (lead.businessType) {
      byBusinessType[lead.businessType].push(lead);
    }

    // Segment by categories
    lead.selectedCategories.forEach(catId => {
      if (byCategory[catId]) byCategory[catId].push(lead);
    });

    // Segment by brands
    lead.selectedBrands.forEach(brandId => {
      if (byBrand[brandId]) byBrand[brandId].push(lead);
    });
  });

  return { hot, warm, cold, byGrade, byBusinessType, byCategory, byBrand };
}

export function getLeadPriorityActions(lead: CustomerData): string[] {
  const score = calculateLeadScore(lead);
  const actions: string[] = [];

  if (score.grade === 'A') {
    actions.push('High-priority follow-up within 24 hours');
    actions.push('Schedule discovery call');
    if (lead.businessType === 'wholesale') {
      actions.push('Prepare volume pricing proposal');
    }
  } else if (score.grade === 'B') {
    actions.push('Send personalized email within 48 hours');
    actions.push('Share product catalog');
  } else if (score.grade === 'C') {
    actions.push('Add to nurture campaign');
    actions.push('Connect on social media');
  } else {
    actions.push('Add to general mailing list');
  }

  // Brand-specific actions
  if (lead.selectedBrands.length > 0) {
    const brandNames = BRANDS
      .filter(b => lead.selectedBrands.includes(b.id))
      .map(b => b.name)
      .join(', ');
    actions.push(`Highlight ${brandNames} products`);
  }

  return actions;
}
