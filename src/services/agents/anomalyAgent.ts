import { TelemetryEvent } from '@/domain/events';

export const THRESHOLDS = {
  BATTERY_MIN: 20.0,
  CPU_LOAD_MAX: 0.90,
  TEMP_MAX: 85.0
};

/**
 * Phase 1 Detection Agent
 * Fast, deterministic. Evaluates raw payloads and returns boolean states.
 */
export async function anomalyAgent(telemetry: TelemetryEvent) {
  const reasoning = [];

  if (telemetry.battery < THRESHOLDS.BATTERY_MIN) {
      reasoning.push(`Battery boundary broken: ${telemetry.battery}% < ${THRESHOLDS.BATTERY_MIN}%`);
  }

  if (telemetry.cpu_load > THRESHOLDS.CPU_LOAD_MAX) {
      reasoning.push(`CPU operational limit breached: ${telemetry.cpu_load.toFixed(2)} > ${THRESHOLDS.CPU_LOAD_MAX}`);
  }

  if (telemetry.temperature > THRESHOLDS.TEMP_MAX) {
      reasoning.push(`Critical thermal event: ${telemetry.temperature.toFixed(1)}C > ${THRESHOLDS.TEMP_MAX}C`);
  }

  return {
      hasAnomaly: reasoning.length > 0 || telemetry.status === 'ERROR',
      reasoningContext: reasoning.length > 0 ? reasoning : ['General Error State Registered'],
  };
}
