/**
 * Asset Controller (K8s Pattern)
 * 
 * Reconciles physical hardware constraints with declarative mission pacement.
 * Implements "Sim2Real" feedback loop for the Control Plane.
 */

import { assetHealthEngine, HardwareVital } from "../assetHealthEngine";
import { fleetManager } from "./fleet-manager";
import { localWatchdog } from "../../robotics/local-watchdog";

export class AssetController {
  private static instance: AssetController;

  static getInstance() {
    if (!AssetController.instance) AssetController.instance = new AssetController();
    return AssetController.instance;
  }

  /**
   * Reconciliation Loop for Assets
   */
  async reconcileHardware() {
    const vitals = assetHealthEngine.updateVitals();
    const missions = fleetManager.getMissions();

    for (const node of vitals) {
      this.reconcileNodeHealth(node, missions);
    }
  }

  private reconcileNodeHealth(node: HardwareVital, missions: any[]) {
    // 0. Dual-Layer Security: Evaluate Hardware Level Instantly (Outside K8s)
    const watchdogStatus = localWatchdog.evaluateSafety(node.id, node.metrics.thermal, false);

    if (watchdogStatus.status === 'EMERGENCY_HALT') {
      // Hardware daemon has already shut this down. K8s just needs to gracefully handle the ghost node.
      console.log(`[ASSET_CONTROLLER] Control Plane detected an EMERGENCY HALT triggered by Hardware Daemon on ${node.id}.`);
    }

    // 1. Kubernetes Control Plane (Cloud Level Eviction)
    if (node.status === 'CRITICAL' || node.status === 'HOT') {
      console.log(`[ASSET_CONTROLLER] Cloud scheduling threshold breached on ${node.id}. Evicting Pods cleanly...`);
      
      // Find missions bound to this unhealthy node
      const boundMissions = missions.filter(m => m.status.nodeBinding === node.id);
      
      for (const mission of boundMissions) {
        // Trigger rescheduling in the mission reconciler
        mission.status.phase = 'Degraded';
        mission.status.nodeBinding = 'PENDING_RESCHEDULE';
        mission.status.conditions.push({
          type: 'Evicted',
          status: 'True',
          reason: 'ThermalThresholdBreach',
          message: `Hardware node ${node.id} reached ${node.metrics.thermal}°C. Workload migrated for protection via Control Plane.`
        });
      }
    }
  }
}

export const assetController = AssetController.getInstance();
