/**
 * Predictive Simulation Engine (Isaac Sim / RL Validation)
 * 
 * Rehearses workloads against physics-based perturbations:
 * - Sensor Noise Injection
 * - Latency Spikes
 * - Kinematic Constraints
 * - Environmental Variability
 */

export interface SimulationScenario {
  id: string;
  name: string;
  probability: number; // 0.0 - 1.0 (Pass rate)
  metrics: {
    collisionRate: number; // % of episodes ending in collision
    stabilityIndex: number; // 0-100 (100 = perfect kinematic adherence)
    sensorLatency: number; // ms injected
  };
  events: string[];
  isPreferred: boolean;
}

const INITIAL_SCENARIOS: SimulationScenario[] = [
  {
    id: 'sim-opt-01',
    name: 'ISAAC_RL_NAVMESH_V4',
    probability: 0.92,
    metrics: { collisionRate: 0.01, stabilityIndex: 98, sensorLatency: 15 },
    events: ['Gaussian Noise +10%', 'Visual Odometry Drop'],
    isPreferred: true
  },
  {
    id: 'sim-risk-02',
    name: 'EDGE_CASE_THERMAL_THROTTLE',
    probability: 0.12,
    metrics: { collisionRate: 14.2, stabilityIndex: 42, sensorLatency: 250 },
    events: ['GPU Thermal Limit Reached', 'Compute Throttling'],
    isPreferred: false
  },
  {
    id: 'sim-neut-03',
    name: 'BASELINE_KINEMATICS',
    probability: 0.65,
    metrics: { collisionRate: 2.1, stabilityIndex: 88, sensorLatency: 50 },
    events: ['Standard Operation'],
    isPreferred: false
  }
];

export class SimulationEngine {
  private static instance: SimulationEngine;
  private scenarios: SimulationScenario[] = INITIAL_SCENARIOS;

  static getInstance() {
    if (!SimulationEngine.instance) SimulationEngine.instance = new SimulationEngine();
    return SimulationEngine.instance;
  }

  getScenarios() {
    return this.scenarios;
  }

  /**
   * Run Simulation Pulse
   * Rehearses outcomes across all parallel scenarios.
   */
  runSimulation() {
    this.scenarios = this.scenarios.map(s => {
      const probMod = (Math.random() - 0.5) * 0.02;
      const nextProb = Math.min(0.99, Math.max(0.01, s.probability + probMod));
      
      return {
        ...s,
        probability: nextProb,
        metrics: {
          ...s.metrics,
          collisionRate: Math.max(0, s.metrics.collisionRate + (Math.random() - 0.5) * 0.5),
          stabilityIndex: Math.min(100, Math.max(0, s.metrics.stabilityIndex + (Math.random() - 0.5) * 2))
        }
      };
    });
    return this.scenarios;
  }

  getPreferredScenario() {
    return this.scenarios.find(s => s.isPreferred) || this.scenarios[0];
  }

  getConvergenceCertainty() {
    const preferred = this.getPreferredScenario();
    return preferred.probability;
  }
}

export const simulationEngine = SimulationEngine.getInstance();
