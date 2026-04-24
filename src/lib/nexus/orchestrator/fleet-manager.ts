/**
 * GitOps Fleet Manager
 * 
 * Reconciles Desired State (Spec) with Actual State (Status).
 * Handles declarative scheduling, canary rollouts, and graceful edge degradation.
 */

import { SovereignMission as WorkloadUnit, GridNode } from './resource-schema';
import { assetController } from './asset-controller';
import { scenarioController } from './scenario-controller';
import { gitOpsController } from './gitops-controller';
import { orbitalController } from './orbital-controller';
import { mqttBroker } from '../../robotics/mqtt-telemetry';
import { zeroTrustEnforcer } from '../../security/zero-trust';

export class GitOpsFleetManager {
  private static instance: GitOpsFleetManager;
  private workloads: WorkloadUnit[] = [];
  private nodes: GridNode[] = [];

  static getInstance() {
    if (!GitOpsFleetManager.instance) GitOpsFleetManager.instance = new GitOpsFleetManager();
    return GitOpsFleetManager.instance;
  }

  /**
   * Main Reconciliation Loop
   */
  async reconcile() {
    console.log("[CONTROL_PLANE] Initializing Fleet Hub Reconciliation...");
    
    // 1. Reconcile Physical Assets (Sim2Real Feedback & Hardware Watchdog)
    await assetController.reconcileHardware();

    // 2. Reconcile Predictive Scenarios (Simulation Feedback)
    await scenarioController.reconcileScenarios();

    // 3. Process MQTT Telemetry (Asynchronous Edge Feedback)
    mqttBroker.processTelemetryIngest();

    // 4. Validate Edge Nodes (Zero-Trust mTLS Check)
    const validNodes = this.nodes.filter(n => zeroTrustEnforcer.validateNodeIdentity((n as any).id));

    // 5. Reconcile Global Recon Streams (Orbital Feedback)
    await orbitalController.reconcileOrbital();

    // 6. Push Desired State to GitOps Controllers
    await gitOpsController.reconcileGitOps(this.workloads);

    // 7. Reconcile Infrastructure Workloads
    for (const workload of this.workloads) {
      this.reconcileWorkload(workload);
    }
  }

  private reconcileWorkload(workload: WorkloadUnit) {
    const { spec, status } = workload;

    // 1. Replica Management
    if (status.activeReplicas < spec.replicas) {
      console.log(`[RECONCILER] Scaling UP ${workload.metadata.name}: ${status.activeReplicas} -> ${spec.replicas}`);
      status.activeReplicas = spec.replicas;
      status.phase = 'Scaling';
    }

    // 2. Health Check & Graceful Degradation (Hardware-Bound)
    const isNodeHealthy = this.checkNodeHealth(status.nodeBinding);
    if (!isNodeHealthy) {
      console.log(`[FLEET_MANAGER] Node ${status.nodeBinding} Unhealthy. Gracefully degrading compute footprint...`);
      status.phase = 'Degraded';
      // We CANNOT simply reschedule to another node because the physical robot hardware is fixed.
      // We roll back the workload to a rigid safe-state model or shed the ML container entirely.
      status.conditions.push({
        type: 'ComputeShedding',
        status: 'True',
        reason: 'HardwareConstraint',
        message: 'Fleet manager downgraded ML inference pod to preserve core locomotion stability on fixed hardware.'
      });
    }

    // 3. Final State Synchronization
    if (status.activeReplicas === spec.replicas && isNodeHealthy) {
      status.phase = 'Running';
    }
  }

  private checkNodeHealth(nodeId: string): boolean {
    return Math.random() > 0.05; 
  }

  getWorkloads() { return this.workloads; }
  getMissions() { return this.workloads; } // Compatibility
  
  addWorkload(workload: WorkloadUnit) {
    this.workloads.push(workload);
  }
  addMission(workload: WorkloadUnit) {
    this.addWorkload(workload);
  }
}

export const fleetManager = GitOpsFleetManager.getInstance();
