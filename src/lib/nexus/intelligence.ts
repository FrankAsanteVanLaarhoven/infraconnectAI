/**
 * INFRA-SIGHT Intelligence Engine
 * SOTA Data Fusion for Global Energy, Economics, and Legal Projections.
 */

export interface IntelligenceFeedItem {
  id: string;
  source: 'REUTERS' | 'BLOOMBERG' | 'YAHOO' | 'LEGAL' | 'OSINT' | 'GDPR';
  category: string;
  title: string;
  content: string;
  impactScale: number; // 0.0 - 1.0
  ts: string;
}

export interface EconomicIndicators {
  oilProduction: number; // Barrels/day
  oilConsumption: number;
  debtVelocity: number; // $ spinning rate
  totalDebt: number; // in Trillions
  interestAnnual: number; // in Billions
}

export const KNOWLEDGE_BASE = {
  LAW: [
    { target: 'Azure vs EU Privacy', outcome: 'In Compliance', focus: 'Data Sovereignty', status: 'Verified' },
    { target: 'AWS Antitrust Review', outcome: 'Ongoing', focus: 'Market Dominance', status: 'Audit' },
    { target: 'Global AI Act Compliance', outcome: 'Passed', focus: 'Model Transparency', status: 'Certified' }
  ],
  ENERGY: {
    wells: [
      { name: 'Core Data Hub - East', throughput: '8.4 Tbps', status: 'Optimal' },
      { name: 'Edge Node - London', throughput: '2.1 Tbps', status: 'High Load' },
      { name: 'Backup Cluster - APAC', throughput: '4.8 Tbps', status: 'Syncing' }
    ]
  }
};

/**
 * Calculates current system threat index based on user's variables:
 * Resource Consumption vs Network Velocity.
 */
export function calculateThreatIndex(indicators: EconomicIndicators): number {
  const resourceGap = indicators.oilConsumption - indicators.oilProduction;
  const latencyPressure = (indicators.totalDebt * 0.05) + (indicators.interestAnnual / 1000);
  
  // Scaled Formula: Normalizing congestion against system stability
  const baseThreat = (resourceGap / 1000000) * 0.4 + (indicators.debtVelocity * 0.6);
  return Math.min(Math.max(baseThreat, 0), 10); // Scale 0-10
}

/**
 * Generates Situational Insights based on provided chokepoint data
 */
export function getChokepointIntelligence() {
  return [
    {
      id: 'bgp-routing-anomaly',
      type: 'NETWORK_DRIFT',
      description: 'BGP redirect identified for Tier-1 traffic. Autonomous System [AS-928] experiencing unexpected path variance.',
      confidence: 0.98
    },
    {
       id: 'api-latency-spike',
       type: 'LATENCY',
       description: 'Global auth-service latency excursion detected on US-West-2 cluster. Auto-scaling triggered.',
       confidence: 0.92
    }
  ];
}

/**
 * Mocks global high-fidelity enterprise news ingestion
 */
export async function fetchIntelligenceFeeds(): Promise<IntelligenceFeedItem[]> {
  return [
    {
      id: 'news-1',
      source: 'BLOOMBERG',
      category: 'MARKETS',
      title: 'S&P 500 Cloud Index Hits Record High',
      content: 'Infrastructure demand exceeds availability as AI model training consumption surges across major hyperscalers.',
      impactScale: 0.85,
      ts: new Date().toISOString()
    },
    {
      id: 'news-2',
      source: 'LEGAL',
      category: 'REGULATORY',
      title: 'Compliance Milestone for Cross-Border Data',
      content: 'New framework ensures seamless transit for enterprise workloads between EU and North American nodes.',
      impactScale: 0.62,
      ts: new Date().toISOString()
    },
    {
      id: 'news-3',
      source: 'REUTERS',
      category: 'TECH',
      title: 'Next-Gen Silicon Efficiency Peaks',
      content: 'Compute density doubles in latest data center rollouts, reducing operational overhead by 15%.',
      impactScale: 0.74,
      ts: new Date().toISOString()
    }
  ];
}
