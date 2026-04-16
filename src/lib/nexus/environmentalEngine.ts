/**
 * Environmental Intelligence Engine
 * 
 * Orchestrates planetary-scale telemetry:
 * - AQI (Air Quality Index)
 * - Seismic Activity (Global Fault Lines)
 * - Thermal Anomaly detection (Wildfires / Heatwaves)
 */

export interface EcologicalMetric {
  id: string;
  name: string;
  type: 'AQI' | 'SEISMIC' | 'THERMAL' | 'FLOOD';
  value: number;
  unit: string;
  location: string;
  status: 'STABLE' | 'DEGRADED' | 'CRITICAL';
  trend: 'UP' | 'DOWN';
}

const INITIAL_METRICS: EcologicalMetric[] = [
  {
    id: 'eco-1',
    name: 'Air Integrity: Delhi',
    type: 'AQI',
    value: 412,
    unit: 'AQI',
    location: 'Delhi, IN',
    status: 'CRITICAL',
    trend: 'UP'
  },
  {
    id: 'eco-2',
    name: 'Thermal Stress: Amazon',
    type: 'THERMAL',
    value: 42.1,
    unit: '°C',
    location: 'Amazon Basin, BR',
    status: 'DEGRADED',
    trend: 'UP'
  },
  {
    id: 'eco-3',
    name: 'Seismic Flux: Tokyo',
    type: 'SEISMIC',
    value: 3.2,
    unit: 'MAG',
    location: 'Kanto Region, JP',
    status: 'STABLE',
    trend: 'DOWN'
  },
  {
    id: 'eco-4',
    name: 'Hydraulic Surplus: Venice',
    type: 'FLOOD',
    value: 1.4,
    unit: 'METERS',
    location: 'Venice, IT',
    status: 'DEGRADED',
    trend: 'UP'
  }
];

export class EnvironmentalEngine {
  private static instance: EnvironmentalEngine;
  private metrics: EcologicalMetric[] = INITIAL_METRICS;

  static getInstance() {
    if (!EnvironmentalEngine.instance) EnvironmentalEngine.instance = new EnvironmentalEngine();
    return EnvironmentalEngine.instance;
  }

  getMetrics() {
    return this.metrics;
  }

  /**
   * Simulated Planetary Update Pulse
   */
  updateMetrics() {
    this.metrics = this.metrics.map(m => {
      const delta = (Math.random() - 0.5) * 2;
      const newValue = Math.max(0, m.value + delta);
      
      let status: EcologicalMetric['status'] = 'STABLE';
      if (m.type === 'AQI' && newValue > 300) status = 'CRITICAL';
      else if (m.type === 'THERMAL' && newValue > 40) status = 'CRITICAL';
      else if (newValue > m.value * 1.5) status = 'DEGRADED';

      return {
        ...m,
        value: newValue,
        status,
        trend: delta > 0 ? 'UP' : 'DOWN'
      };
    });
    return this.metrics;
  }

  getOverallPlanetaryRisk() {
    const criticals = this.metrics.filter(m => m.status === 'CRITICAL').length;
    return Math.min(1.0, (criticals * 0.2) + 0.1);
  }
}

export const environmentalEngine = EnvironmentalEngine.getInstance();
