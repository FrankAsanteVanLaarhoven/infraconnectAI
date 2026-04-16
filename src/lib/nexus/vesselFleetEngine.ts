/**
 * Vessel Fleet Engine
 * 
 * Orchestrates simulation and tracking of global maritime assets.
 * Focuses on chokepoint transit and supply chain ripple analysis.
 */

export interface Vessel {
  id: string;
  name: string;
  type: string;
  status: 'UNDERWAY' | 'MOORED' | 'DARK' | 'DEVIATING';
  lat: number;
  lng: number;
  course: number;
  speed: number; // Knots
  destination: string;
  cargoImpact: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const INITIAL_VESSELS: Vessel[] = [
  {
    id: 'v-1',
    name: 'ADVANTAGE VITAL',
    type: 'VLCC TANKER',
    status: 'UNDERWAY',
    lat: 26.24,
    lng: 55.08,
    course: 310,
    speed: 12.4,
    destination: 'HORMUZ PORT',
    cargoImpact: 'Energy / Crude',
    riskLevel: 'LOW'
  },
  {
    id: 'v-2',
    name: 'PACIFIC BRAVE',
    type: 'CONTAINER',
    status: 'DEVIATING',
    lat: 1.29,
    lng: 103.85,
    course: 270,
    speed: 18.2,
    destination: 'PORT OF SINGAPORE',
    cargoImpact: 'Semiconductors',
    riskLevel: 'HIGH'
  },
  {
    id: 'v-3',
    name: 'M/T SHADOW',
    type: 'SPOOFED_ID',
    status: 'DARK',
    lat: 26.6,
    lng: 55.4,
    course: 0,
    speed: 4.5,
    destination: 'FUJAIRAH [UNCONFIRMED]',
    cargoImpact: 'Sanctioned Oil',
    riskLevel: 'CRITICAL'
  }
];

export class VesselFleetEngine {
  private static instance: VesselFleetEngine;
  private vessels: Vessel[] = INITIAL_VESSELS;

  static getInstance() {
    if (!VesselFleetEngine.instance) VesselFleetEngine.instance = new VesselFleetEngine();
    return VesselFleetEngine.instance;
  }

  getVessels() {
    return this.vessels;
  }

  /**
   * Simulated AIS Update Pulse
   */
  updateFleet() {
    this.vessels = this.vessels.map(v => {
      if (v.status === 'DARK') return v;
      
      // Simple drift simulation
      const latDelta = (Math.random() - 0.5) * 0.01;
      const lngDelta = (Math.random() - 0.5) * 0.01;
      
      return {
        ...v,
        lat: v.lat + latDelta,
        lng: v.lng + lngDelta,
        speed: Math.max(0, v.speed + (Math.random() - 0.5) * 0.5)
      };
    });
    return this.vessels;
  }

  detectDarkVessels() {
    return this.vessels.filter(v => v.status === 'DARK' || v.status === 'DEVIATING');
  }
}

export const vesselFleetEngine = VesselFleetEngine.getInstance();
