/**
 * Domain-Driven Robotics Event Stream Definitions
 * Core Architecture Schema mimicking strict Kafka semantics within Redis Streams.
 */

// 1. Telemetry Stream (robot.telemetry)
export interface TelemetryEvent {
  robot_id: string;
  timestamp: number;
  battery: number;
  cpu_load: number;
  temperature: number;
  position: { x: number; y: number; z: number };
  status: "ACTIVE" | "DEGRADED" | "OFFLINE";
}

// 2. Alerts / Anomalies (robot.alerts)
export interface AlertEvent {
  robot_id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type: string; // e.g. 'JOINT_FAILURE'
  message: string;
  timestamp: number;
}

// 3. Commands (robot.commands)
export interface CommandEvent {
  command_id: string;
  robot_id: string;
  action: string;
  parameters: Record<string, any>;
  issued_by: string; // "agent/system" or "operator:ux"
  timestamp: number;
}

// 4. Agent Actions (agent.actions)
export interface AgentActionEvent {
  agent: string; // "anomaly-detector"
  decision: string;
  reason: string;
  target: string;
  timestamp: number;
}

// 5. System State (system.state)
export interface SystemStateEvent {
  fleet_size: number;
  active_alerts: number;
  healthy: number;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHYSICAL AI CORE — v3.0 Stream Definitions
// ═══════════════════════════════════════════════════════════════════════════════

// 6. Physics Telemetry (physics.telemetry)
export interface PhysicsTelemetryEvent {
  runId: string;
  episodeIndex: number;
  physicsRealism: number;
  sensorFidelity: number;
  languageGrounding: number;
  actionSuccess: number;
  modelLoss: number;
  timestamp: number;
}

// 7. Physics Curation Decisions (physics.curation)
export interface CurationDecisionEvent {
  runId: string;
  decisions: Array<{
    episodeIndex: number;
    action: 'PRUNE' | 'KEEP' | 'FLAG_HUMAN_REVIEW' | 'PROMOTE_TO_CANON';
    reason: string;
    confidence: number;
  }>;
  timestamp: number;
}

// Registry mapped against keys
export type SystemStreamMap = {
  "stream:robot.telemetry": TelemetryEvent;
  "stream:robot.alerts": AlertEvent;
  "stream:robot.commands": CommandEvent;
  "stream:agent.actions": AgentActionEvent;
  "stream:system.state": SystemStateEvent;
  "stream:physics.telemetry": PhysicsTelemetryEvent;
  "stream:physics.curation": CurationDecisionEvent;
};
