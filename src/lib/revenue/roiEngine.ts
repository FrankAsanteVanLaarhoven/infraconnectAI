/**
 * ROI Intelligence Engine
 * 
 * Calculates projected financial impact based on firmographic and behavioral data.
 */

export interface ROIMetrics {
  velocityGain: number;       // Annual Engineering savings
  infraEfficiency: number;   // Annual OpEx savings
  riskReduction: number;     // Annualized loss expectancy reduction
  totalAnnualImpact: number;
  threeYearROI: number;
  paybackMonths: number;
}

export function calculateLeadROI(score: number, projectedValue: number | null, companySize?: string): ROIMetrics {
  // Base hourly rates and multipliers
  const avgDevHourly = 85; 
  const teamsSize = companySize === 'enterprise' ? 100 : companySize === 'mid-market' ? 25 : 5;
  const efficiencyGain = score > 80 ? 0.35 : score > 50 ? 0.20 : 0.10;
  
  // 1. Engineering Velocity (Time-to-market impact)
  const annualHours = 2000;
  const velocityGain = teamsSize * annualHours * avgDevHourly * efficiencyGain;

  // 2. Infra Efficiency (Cloud/Hardware OpEx)
  // Assume infra spend is roughly 10% of engineering budget
  const annualInfraSpend = (teamsSize * annualHours * avgDevHourly) * 0.1;
  const infraEfficiency = annualInfraSpend * (efficiencyGain * 1.5); // AI optimization is higher for infra

  // 3. Risk Reduction (Security)
  // Breach cost avg $4M, assuming 1% probability reduction
  const riskReduction = 4000000 * 0.01 * (score / 100);

  const totalAnnualImpact = velocityGain + infraEfficiency + riskReduction;
  const costOfImplementation = projectedValue || (score * 1500);
  
  const threeYearROI = ((totalAnnualImpact * 3) - costOfImplementation) / costOfImplementation;
  const paybackMonths = (costOfImplementation / (totalAnnualImpact / 12));

  return {
    velocityGain,
    infraEfficiency,
    riskReduction,
    totalAnnualImpact,
    threeYearROI,
    paybackMonths
  };
}

export function getROISummary(metrics: ROIMetrics): string {
  return `Projected Annual Impact: £${metrics.totalAnnualImpact.toLocaleString()}
3-Year ROI: ${(metrics.threeYearROI * 100).toFixed(0)}%
Payback Period: ${metrics.paybackMonths.toFixed(1)} months
Leverage Points: 
- Engineering velocity gain of £${metrics.velocityGain.toLocaleString()}
- Total risk mitigation value of £${metrics.riskReduction.toLocaleString()}`;
}
