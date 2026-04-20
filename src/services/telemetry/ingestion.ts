import { streamProducer } from '@/infrastructure/redis/producer';
import { TelemetryEvent, AlertEvent } from '@/domain/events';
import { orchestrator } from '@/services/agents/orchestrator';

/**
 * Platform Services: Telemetry Ingestion Layer
 * 
 * Boundary interface for raw MQTT/Edge data entering the system.
 */
export class TelemetryService {
  
  /**
   * Primary ingress method.
   * In production, this receives a direct push from the Nginx API gateway 
   * or a raw MQTT bridge.
   */
  static async ingestRobotState(payload: Partial<TelemetryEvent>) {
    
    // Construct validated entity
    const telemetry: TelemetryEvent = {
        robot_id: payload.robot_id || 'unknown',
        timestamp: payload.timestamp || Date.now(),
        battery: payload.battery ?? 100,
        cpu_load: payload.cpu_load ?? 0.1,
        temperature: payload.temperature ?? 40.0,
        position: payload.position || { x: 0, y: 0, z: 0 },
        status: payload.status || 'ACTIVE'
    };

    // 1. Publish raw telemetry stream to Redis Backbone
    await streamProducer.publish("stream:robot.telemetry", telemetry);

    // 2. Pipe to Multi-Agent Orchestrator
    orchestrator(telemetry).catch(e => {
        console.error('[ORCHESTRATOR] Workflow execution failed', e);
    });

    return telemetry;
  }

  /**
   * Direct high-severity alert ingestion bypassing standard telemetry cycles
   */
  static async ingestHardwareAlert(payload: Partial<AlertEvent>) {
      const alert: AlertEvent = {
          robot_id: payload.robot_id || 'unknown',
          severity: payload.severity || 'CRITICAL',
          type: payload.type || 'SYSTEM_FAILURE',
          message: payload.message || 'Unhandled Hardware Fault',
          timestamp: payload.timestamp || Date.now()
      };

      await streamProducer.publish("stream:robot.alerts", alert);

      // Instantly trigger recovery workflows for critical alerts
      if (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') {
          await streamProducer.publish("stream:agent.actions", {
             agent: "anomaly-detector",
             decision: "trigger_recovery",
             reason: alert.message,
             target: alert.robot_id,
             timestamp: Date.now()
          });
      }
  }
}
