import { streamProducer } from '@/infrastructure/redis/producer';
import { TelemetryEvent } from '@/domain/events';

/**
 * Control Plane Workflow: Anomaly Detection
 * 
 * Replaces the monolithic AutonomousOptimizer inside lib/
 * Runs purely on the Node server, listening to teleported streams.
 */
export async function evaluateTelemetryForAnomalies(telemetry: TelemetryEvent) {
  const reasoning: string[] = [];

  const isBatteryCritical = telemetry.battery < 20;
  if (isBatteryCritical) {
    reasoning.push(`Battery critical condition detected (< 20%)`);
  }

  const isCpuOverloaded = telemetry.cpu_load > 0.90;
  if (isCpuOverloaded) {
    reasoning.push(`CPU execution load exceeded safe parameters (> 90%)`);
  }
  
  // Custom mock trigger from the Demo Orchestrator (HARDWARE_ANOMALY translates to this state)
  const isTorqueSpike = telemetry.temperature > 85.0;
  if (isTorqueSpike) {
    reasoning.push(`Actuator casing thermal state spike (> 85.0C)`);
  }

  if ((isBatteryCritical || isCpuOverloaded) && isTorqueSpike) {
    console.warn(`[CONTROL_PLANE] Critical Anomaly Detected on ${telemetry.robot_id}`);
    
    // 1. Emit Agent Action WITH Explanatory logic
    await streamProducer.publish("stream:agent.actions", {
      agent: "anomaly-detector",
      decision: "TRIGGER_RECOVERY_PROTOCOL",
      // reasonContext: reasoning,
      reason: "battery drop + torque anomaly (temperature spike)",
      target: telemetry.robot_id,
      timestamp: Date.now()
    });

    // 2. Automatically dispatch Command Downstream
    await streamProducer.publish("stream:robot.commands", {
      command_id: `sys-recv-${Date.now()}`,
      robot_id: telemetry.robot_id,
      action: "RESTART_JOINT",
      parameters: {
        joint: "right_arm",
        safe_mode: true
      },
      issued_by: "agent/system",
    } as any);
  }
}
