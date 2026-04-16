/**
 * IP Protection & Patent Tracker
 * 
 * Monitors the competitive resilience of InfraConnect proprietary kernels.
 * Tracks "Patent Magnitude" and defensive IP positions.
 */

export interface Patent {
  id: string;
  title: string;
  status: 'FILED' | 'PUBLISHED' | 'GRANTED' | 'DEFENSIVE';
  resilienceScore: number; // Competitive defensibility (0-100)
  estimatedValue: number; // GBP
}

export const STRATEGIC_IP_PORTFOLIO: Patent[] = [
  { id: 'pat-01', title: 'Swarm-Based Sovereign Inference Sharding', status: 'GRANTED', resilienceScore: 98, estimatedValue: 12500000 },
  { id: 'pat-02', title: 'Kinematic Stability Kernel for Orin-NX', status: 'FILED', resilienceScore: 84, estimatedValue: 4500000 },
  { id: 'pat-03', title: 'Zero-Trust Deal Synthesis Architecture', status: 'PUBLISHED', resilienceScore: 91, estimatedValue: 2100000 },
  { id: 'pat-04', title: 'Non-Attributable OSINT Fusion Grid', status: 'DEFENSIVE', resilienceScore: 72, estimatedValue: 0 }
];

export function getTotalIPMagnitude(): number {
  return STRATEGIC_IP_PORTFOLIO.reduce((acc, p) => acc + p.estimatedValue, 0);
}

export function getPortfolioResilience(): number {
  return STRATEGIC_IP_PORTFOLIO.reduce((acc, p) => acc + p.resilienceScore, 0) / STRATEGIC_IP_PORTFOLIO.length;
}
