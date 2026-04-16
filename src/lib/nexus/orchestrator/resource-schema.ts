/**
 * Sovereign Resource Schema (K8s Ideology)
 * 
 * Defines the Custom Resource Definitions (CRDs) for the Neural Grid.
 */

export type MissionPhase = 'Pending' | 'Scaling' | 'Running' | 'Degraded' | 'Terminating' | 'Succeeded';

export interface SovereignMission {
  apiVersion: 'infraconnect.ai/v1alpha1';
  kind: 'Mission';
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
  };
  spec: {
    objectives: string[];
    priority: number; // 0-100
    aggression: number; // 0.0 - 1.0
    targetSector: string;
    replicas: number; // Number of agents assigned
    nodeSelector: {
      type: 'ORIN-NX' | 'GENERIC' | 'EDGE';
    };
  };
  status: {
    phase: MissionPhase;
    activeReplicas: number;
    nodeBinding: string;
    telemetry: {
      cpu: number;
      memory: number;
      latencies: number[];
    };
    conditions: {
      type: string;
      status: 'True' | 'False';
      reason: string;
      message: string;
    }[];
  };
}

export interface GridNode {
  metadata: {
    name: string;
    labels: Record<string, string>;
  };
  status: {
    capacity: { cpu: string; memory: string };
    allocatable: { cpu: string; memory: string };
    conditions: { type: string; status: string }[];
  };
}
