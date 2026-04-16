/**
 * Orbital Controller (K8s Pattern)
 * 
 * Reconciles mission reconnaissance objectives with orbital visibility windows.
 * Implements the Space-Layer feedback loop for the Control Plane.
 */

import { orbitalEngine, OrbitalSignal } from "../orbitalEngine";
import { fleetManager } from "./fleet-manager";

export class OrbitalController {
  private static instance: OrbitalController;

  static getInstance() {
    if (!OrbitalController.instance) OrbitalController.instance = new OrbitalController();
    return OrbitalController.instance;
  }

  /**
   * Reconciliation Loop for Orbital Assets
   */
  async reconcileOrbital() {
    const signals = orbitalEngine.performSweep();
    const missions = fleetManager.getMissions();

    for (const signal of signals) {
      this.reconcileSignalAnomaly(signal, missions);
    }
  }

  private reconcileSignalAnomaly(signal: OrbitalSignal, missions: any[]) {
    // 1. Detect Dark Vessel / Infrastructure Anomaly
    if (signal.isAnomaly && signal.confidence > 0.85) {
      console.log(`[ORBITAL_CONTROLLER] High Confidence Anomaly Detected at ${signal.coordinates}. Triggering Response...`);
      
      // Find missions targeting this sector
      const validMissions = missions.filter(m => m.spec.targetSector === 'APAC' || m.spec.targetSector === 'GLOBAL');
      
      for (const mission of validMissions) {
        // Inject orbital truth into the mission status
        mission.status.conditions.push({
          type: 'OrbitalTruthFound',
          status: 'True',
          reason: signal.type,
          message: `Orbital engine discovered ${signal.target} at ${signal.coordinates}. AIS transponder mismatch confirmed.`
        });
        
        // Boost aggression automatically if an anomaly is found
        if (mission.spec.aggression < 0.9) {
           mission.spec.aggression += 0.05;
           console.log(`[ORBITAL_CONTROLLER] Boosting aggression for ${mission.metadata.name} due to orbital truth.`);
        }
      }
    }
  }
}

export const orbitalController = OrbitalController.getInstance();
