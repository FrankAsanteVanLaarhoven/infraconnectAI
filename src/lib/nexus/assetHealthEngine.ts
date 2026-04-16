/**
 * Hardware Health Engine (Sim2Real Feedback)
 * 
 * Orchestrates physical asset telemetry:
 * - Thermal Stress (T-DIE)
 * - Power Utilization (mW)
 * - GPU / NVDLA Load
 * - Storage Wear (S.M.A.R.T)
 */

export interface HardwareVital {
  id: string;
  name: string;
  type: 'ORIN-NX' | 'EDGE-POD' | 'SERVER';
  metrics: {
    thermal: number; // Celsius
    power: number; // Watts
    gpuLoad: number; // Percent
    memoryLoad: number; // Percent
  };
  status: 'OPTIMAL' | 'WARM' | 'HOT' | 'CRITICAL';
  location: string;
}

const INITIAL_HARDWARE: HardwareVital[] = [
  {
    id: 'node-hq-01',
    name: 'ORIN-NX-01 (HQ)',
    type: 'ORIN-NX',
    metrics: { thermal: 42.4, power: 15.2, gpuLoad: 68, memoryLoad: 42 },
    status: 'OPTIMAL',
    location: 'London, UK'
  },
  {
    id: 'node-edge-02',
    name: 'SMR-EDGE-01',
    type: 'EDGE-POD',
    metrics: { thermal: 68.1, power: 28.4, gpuLoad: 92, memoryLoad: 81 },
    status: 'WARM',
    location: 'North Sea Rig'
  },
  {
    id: 'node-jetson-03',
    name: 'DRONE-CO-03',
    type: 'ORIN-NX',
    metrics: { thermal: 38.2, power: 8.4, gpuLoad: 12, memoryLoad: 15 },
    status: 'OPTIMAL',
    location: 'Global Transit'
  }
];

export class AssetHealthEngine {
  private static instance: AssetHealthEngine;
  private vitals: HardwareVital[] = INITIAL_HARDWARE;

  static getInstance() {
    if (!AssetHealthEngine.instance) AssetHealthEngine.instance = new AssetHealthEngine();
    return AssetHealthEngine.instance;
  }

  getVitals() {
    return this.vitals;
  }

  /**
   * Simulated Real-World Telemetry Pulse
   */
  updateVitals() {
    this.vitals = this.vitals.map(v => {
      const gpuMod = (Math.random() - 0.5) * 10;
      const thermalMod = gpuMod * 0.4;
      
      const nextGpu = Math.min(100, Math.max(0, v.metrics.gpuLoad + gpuMod));
      const nextThermal = Math.min(100, Math.max(20, v.metrics.thermal + thermalMod));

      let status: HardwareVital['status'] = 'OPTIMAL';
      if (nextThermal > 85) status = 'CRITICAL';
      else if (nextThermal > 70) status = 'HOT';
      else if (nextThermal > 55) status = 'WARM';

      return {
        ...v,
        metrics: {
          ...v.metrics,
          gpuLoad: nextGpu,
          thermal: nextThermal,
          power: 5 + (nextGpu * 0.25)
        },
        status
      };
    });
    return this.vitals;
  }

  getHardwareDensityScore() {
    const totalNodes = this.vitals.length;
    const criticals = this.vitals.filter(v => v.status === 'CRITICAL').length;
    return (totalNodes - criticals) / totalNodes;
  }
}

export const assetHealthEngine = AssetHealthEngine.getInstance();
