import { CustomerData, BRANDS, CATEGORIES } from '../types';

export async function generateAIInsights(data: CustomerData): Promise<string> {
  // Get brand and category names
  const selectedBrands = BRANDS
    .filter((b) => data.selectedBrands.includes(b.id))
    .map((b) => b.name);

  const selectedCategories = CATEGORIES
    .filter((c) => data.selectedCategories.includes(c.id))
    .map((c) => c.name);

  // Build context for AI analysis
  const context = {
    businessType: data.businessType,
    businessName: data.businessName,
    location: `${data.city}, ${data.state}`,
    brands: selectedBrands,
    categories: selectedCategories,
    notes: data.notes,
  };

  // Try to call OpenAI API if available
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a helpful sales assistant for a distribution company that sells vape products, smoke shop items, and convenience store items. Analyze customer preferences and provide brief, actionable insights for the sales team. Keep responses concise (2-3 paragraphs max).`
            },
            {
              role: 'user',
              content: `Analyze this trade show lead and provide insights:

Business Type: ${context.businessType}
Business Name: ${context.businessName || 'Not provided'}
Location: ${context.location}
Interested Brands: ${context.brands.join(', ')}
Interested Categories: ${context.categories.join(', ')}
Customer Notes: ${context.notes || 'None'}

Provide:
1. A brief customer profile summary
2. Recommended products/promotions to highlight
3. Best follow-up approach based on their preferences`
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.choices[0].message.content;
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
    }
  }

  // Fallback to local AI-like analysis
  return generateLocalInsights(context);
}

function generateLocalInsights(context: {
  businessType: string;
  businessName: string;
  location: string;
  brands: string[];
  categories: string[];
  notes: string;
}): string {
  const insights: string[] = [];

  // Customer Profile
  const profileType = context.businessType === 'wholesale' 
    ? 'a wholesale buyer likely looking for bulk pricing and consistent supply'
    : 'a retail customer focused on variety and trending products';
  
  insights.push(`Customer Profile: This is ${profileType}${context.businessName ? ` from ${context.businessName}` : ''}${context.location !== ', ' ? ` in ${context.location}` : ''}.`);

  // Brand Analysis
  if (context.brands.length > 0) {
    const brandInsight = context.brands.length >= 4
      ? 'Shows strong interest across multiple brands - potential high-volume customer'
      : `Focused interest in ${context.brands.join(' and ')} - highlight latest products from these brands`;
    insights.push(`Brand Preference: ${brandInsight}.`);
  }

  // Category Analysis
  if (context.categories.length > 0) {
    const categoryPriorities: string[] = [];
    
    if (context.categories.includes('Vapes') || context.categories.includes('Devices')) {
      categoryPriorities.push('core vaping products');
    }
    if (context.categories.includes('Vape Juice')) {
      categoryPriorities.push('e-liquid variety');
    }
    if (context.categories.includes('Hemp Products')) {
      categoryPriorities.push('hemp/CBD offerings');
    }
    if (context.categories.includes('Smoke Shop Items')) {
      categoryPriorities.push('smoke accessories');
    }
    if (context.categories.includes('Convenience Store Items')) {
      categoryPriorities.push('convenience items for broader inventory');
    }

    insights.push(`Product Focus: Customer interested in ${categoryPriorities.join(', ')}. ${context.categories.length >= 4 ? 'Consider presenting a comprehensive catalog.' : 'Prioritize these categories in follow-up.'}`);
  }

  // Follow-up Recommendations
  const followUp = context.businessType === 'wholesale'
    ? 'Schedule a call to discuss volume pricing, payment terms, and delivery schedules. Prepare wholesale catalog and MOQ information.'
    : 'Send product recommendations with retail pricing. Include any current promotions or new arrivals.';
  
  insights.push(`Follow-up Action: ${followUp}`);

  // Notes Analysis
  if (context.notes && context.notes.length > 20) {
    insights.push(`Special Note: Customer provided detailed notes - review carefully for specific requirements or questions that need addressing.`);
  }

  return insights.join('\n\n');
}

export async function generateBulkAnalysis(leads: CustomerData[]): Promise<string> {
  if (leads.length === 0) {
    return 'No leads to analyze.';
  }

  const analysis = {
    totalLeads: leads.length,
    wholesaleCount: leads.filter(l => l.businessType === 'wholesale').length,
    retailCount: leads.filter(l => l.businessType === 'retail').length,
    brandPopularity: BRANDS.map(b => ({
      name: b.name,
      count: leads.filter(l => l.selectedBrands.includes(b.id)).length
    })).sort((a, b) => b.count - a.count),
    categoryPopularity: CATEGORIES.map(c => ({
      name: c.name,
      count: leads.filter(l => l.selectedCategories.includes(c.id)).length
    })).sort((a, b) => b.count - a.count),
    stateDistribution: leads.reduce((acc, l) => {
      if (l.state) {
        acc[l.state] = (acc[l.state] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
  };

  const topBrands = analysis.brandPopularity.slice(0, 3);
  const topCategories = analysis.categoryPopularity.slice(0, 3);
  const topStates = Object.entries(analysis.stateDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return `
Lead Analysis Summary

Overview
• Total Leads: ${analysis.totalLeads}
• Wholesale: ${analysis.wholesaleCount} (${Math.round(analysis.wholesaleCount / analysis.totalLeads * 100)}%)
• Retail: ${analysis.retailCount} (${Math.round(analysis.retailCount / analysis.totalLeads * 100)}%)

Top Brands
${topBrands.map((b, i) => `${i + 1}. ${b.name} - ${b.count} leads (${Math.round(b.count / analysis.totalLeads * 100)}%)`).join('\n')}

Top Categories
${topCategories.map((c, i) => `${i + 1}. ${c.name} - ${c.count} leads (${Math.round(c.count / analysis.totalLeads * 100)}%)`).join('\n')}

Geographic Distribution
${topStates.length > 0 ? topStates.map(([state, count]) => `• ${state}: ${count} leads`).join('\n') : 'No location data available'}

Recommendations
${analysis.wholesaleCount > analysis.retailCount 
  ? '• Focus on B2B outreach and volume pricing discussions\n• Prepare wholesale catalogs and MOQ sheets' 
  : '• Emphasize retail promotions and product variety\n• Consider loyalty programs for repeat customers'}
${topBrands[0]?.count > analysis.totalLeads * 0.5 
  ? `\n• ${topBrands[0].name} is a clear favorite - ensure adequate inventory and highlight new releases` 
  : ''}
${topCategories[0]?.count > analysis.totalLeads * 0.5 
  ? `\n• Strong demand for ${topCategories[0].name} - consider featured promotions in this category` 
  : ''}
  `.trim();
}
