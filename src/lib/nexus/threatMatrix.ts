/**
 * Revenue-at-Risk Matrix
 * 
 * Fuses OSINT signals (Maritime, Financial, Legal) with CRM lead
 * data to identify strategic exposure and calculate risk impact.
 */

import { MaritimeAlert, MarketPulse } from "./osint-fusion";

export interface ThreatenedLead {
  leadId: string;
  email: string;
  sector: string;
  region: string;
  projectedValue: number;
  riskScore: number; // 0-100
  threats: string[];
}

export function calculateThreatExposure(
  leads: any[], 
  maritimeAlerts: MaritimeAlert[],
  marketPulses: MarketPulse[]
): ThreatenedLead[] {
  return leads.map(lead => {
    let riskScore = 0;
    const threats: string[] = [];

    // 1. Maritime Chokepoint Correlation (Energy / Gov)
    const activeMaritimeThreats = maritimeAlerts.filter(a => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL');
    if (activeMaritimeThreats.length > 0 && (lead.sector === 'Energy' || lead.sector === 'Gov')) {
       // High exposure if the lead is in a maritime-heavy sector
       riskScore += 30;
       threats.push("Maritime Chokepoint Alert: Operational Delay");
    }

    // 2. Financial Sentiment Correlation
    const bearishSentiments = marketPulses.filter(p => p.sentiment === 'BEARISH');
    if (bearishSentiments.length > 0) {
       riskScore += 15 * bearishSentiments.length;
       threats.push(`Market Volatility: ${bearishSentiments[0].impact} impact`);
    }

    // 3. Region Specific Risks
    if (lead.region === 'EMEA' && activeMaritimeThreats.some(a => a.description.includes('Hormuz'))) {
      riskScore += 40;
      threats.push("Critical Regional Exposure: Middle East Conflict Pulse");
    }

    return {
      leadId: lead.id,
      email: lead.email,
      sector: lead.sector || 'General',
      region: lead.region || 'Global',
      projectedValue: lead.projectedValue || 0,
      riskScore: Math.min(riskScore, 100),
      threats
    };
  });
}

export function getSystemWideRisk(threatenedLeads: ThreatenedLead[]): number {
  if (threatenedLeads.length === 0) return 0;
  return threatenedLeads.reduce((acc, l) => acc + l.riskScore, 0) / threatenedLeads.length;
}
