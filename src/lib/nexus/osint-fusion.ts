"use client";

/**
 * OSINT Fusion Engine
 * 
 * Aggregates intelligence from the provided strategic briefings:
 * - RADARSAT Constellation Mission (RCM) SAR metadata
 * - Strait of Hormuz Transit Analytics (from spatialintelligence.ai)
 * - Public Financial/Legal RSS-style streams
 */

export interface MaritimeAlert {
  id: string;
  type: 'SAR_LOG' | 'CHOKEPOINT_STATUS' | 'DARK_VESSEL';
  title: string;
  description: string;
  timestamp: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface MarketPulse {
  source: string;
  headline: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impact: string;
}

export const fetchChokepointIntel = (): MaritimeAlert[] => {
  return [
    {
      id: 'rcm-01',
      type: 'SAR_LOG',
      title: 'RADARSAT-3 SAR Log: Hormuz',
      description: 'Synthetic Aperture Radar scan detected 12 unidentified "Dark Vessels" in northern transit zone. Probability of spoofing: 92%.',
      timestamp: '2m ago',
      riskLevel: 'HIGH'
    },
    {
      id: 'choke-01',
      type: 'CHOKEPOINT_STATUS',
      title: 'Strait of Hormuz: Transit Impediment',
      description: 'Total vessel transit volume decreased by 42% over last 24h. Insurance premiums for VLCC class surged by $1.2M per voyage.',
      timestamp: '14m ago',
      riskLevel: 'CRITICAL'
    },
    {
      id: 'dark-01',
      type: 'DARK_VESSEL',
      title: 'Dark Vessel Acquisition: P-421',
      description: 'Vessel identified as "M/T Shadow" - AIS deactivated at 26.6°N 55.4°E. RADARSAT tracking confirmed destination: Port of Fujairah.',
      timestamp: '2s ago',
      riskLevel: 'MEDIUM'
    }
  ];
};

export const fetchMarketPulse = (): MarketPulse[] => {
  return [
    { source: 'Reuters', headline: 'Brent Crude spikes to $94.2 amid Hormuz transit alert.', sentiment: 'BULLISH', impact: '+4.2%' },
    { source: 'CNBC', headline: 'Fed Chair indicates potential rate pause as energy volatility rises.', sentiment: 'NEUTRAL', impact: 'STABLE' },
    { source: 'Yahoo Finance', headline: 'Global Logistics ETF (GLOG) drops 12% on shipping lane blockage.', sentiment: 'BEARISH', impact: '-12.4%' }
  ];
};

export const fetchLegalPulse = () => {
  return [
    { id: 1, text: 'UK High Court rules in favor of Apple in IP copyright dispute vs. Corellium.', time: '1h ago' },
    { id: 2, text: 'EU GDPR fine of €140M issued to major social platform for data silo violations.', time: '4h ago' },
    { id: 3, text: 'Pending: US Department of Justice antitrust hearing vs. Silicon Valley conglomerate.', time: '12h ago' }
  ];
};
