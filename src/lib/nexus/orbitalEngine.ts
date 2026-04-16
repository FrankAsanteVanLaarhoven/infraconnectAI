/**
 * Orbital Intelligence Engine (God-Eye View)
 * 
 * Orchestrates satellite reconnaissance:
 * - SAR (Synthetic Aperture Radar) passes
 * - Optical Change Detection
 * - AIS Correlation (Detection of Ghost Vessels)
 * - Industrial Site Discovery
 */

export interface OrbitalSignal {
  id: string;
  type: 'SAR_SCAN' | 'OPTICAL' | 'AIS_FAME';
  target: string;
  coordinates: string;
  confidence: number; // 0.0 - 1.0
  isAnomaly: boolean;
  timestamp: string;
}

const INITIAL_SIGNALS: OrbitalSignal[] = [
  {
    id: 'sig-sar-01',
    type: 'SAR_SCAN',
    target: 'Dalian Naval Hub',
    coordinates: '38.9°N, 121.6°E',
    confidence: 0.98,
    isAnomaly: false,
    timestamp: new Date().toISOString()
  },
  {
    id: 'sig-opt-02',
    type: 'OPTICAL',
    target: 'Terafab Phase 4 Site',
    coordinates: '30.2°N, 97.6°W',
    confidence: 0.94,
    isAnomaly: true,
    timestamp: new Date().toISOString()
  },
  {
    id: 'sig-ais-03',
    type: 'AIS_FAME',
    target: 'Unknown Vessel (Ghost)',
    coordinates: '53.5°N, 1.2°E',
    confidence: 0.82,
    isAnomaly: true,
    timestamp: new Date().toISOString()
  }
];

export class OrbitalEngine {
  private static instance: OrbitalEngine;
  private signals: OrbitalSignal[] = INITIAL_SIGNALS;

  static getInstance() {
    if (!OrbitalEngine.instance) OrbitalEngine.instance = new OrbitalEngine();
    return OrbitalEngine.instance;
  }

  getSignals() {
    return this.signals;
  }

  /**
   * Orbital Sweep Logic
   */
  performSweep() {
    this.signals = this.signals.map(s => {
      const confidenceMod = (Math.random() - 0.5) * 0.05;
      const nextConfidence = Math.min(1.0, Math.max(0.7, s.confidence + confidenceMod));
      
      // Randomly discover new anomalies
      const isAnomaly = Math.random() > 0.85;

      return {
        ...s,
        confidence: nextConfidence,
        isAnomaly: isAnomaly ? true : s.isAnomaly,
        timestamp: new Date().toISOString()
      };
    });
    return this.signals;
  }

  getOrbitalIntegrityScore() {
    const total = this.signals.length;
    const anomalies = this.signals.filter(s => s.isAnomaly).length;
    return (total - (anomalies * 0.5)) / total;
  }
}

export const orbitalEngine = OrbitalEngine.getInstance();
