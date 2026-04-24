import { db as prisma } from '@/lib/db';

export class ROS2TelemetryEngine {
  async getLiveJointStates(robotId: string) {
    try {
      // Fetch latest joint states from ROS 2 bridge
      return await prisma.robotTelemetry.findFirst({
        where: { robotId, type: 'joint_states' },
        orderBy: { timestamp: 'desc' },
      });
    } catch (e) {
      // Graceful fallback for demo/development if DB not reachable
      return { data: { effort: [20, 30, 15, 10, 5, 48], position: [0.1, 0.2, -0.1, 0, 1.5, 0] } };
    }
  }

  async getBatteryAndThermal(robotId: string) {
    try {
      return await prisma.robotTelemetry.findFirst({
        where: { robotId, type: 'battery_thermal' },
        orderBy: { timestamp: 'desc' },
      });
    } catch (e) {
      return { data: { percentage: 84, temperature: 42.5 } };
    }
  }

  async detectAnomalies(robotId: string) {
    const latest = await this.getLiveJointStates(robotId);
    if (!latest) return [];

    const anomalies: { type: string; severity: string; message: string; }[] = [];
    
    const latestData = latest.data as any;
    // High joint effort detection
    if (latestData?.effort?.some((e: number) => e > 45)) {
      anomalies.push({
        type: 'HIGH_JOINT_EFFORT',
        severity: 'warning',
        message: 'One or more joints exceeding safe effort threshold (>45)',
      });
    }

    // High temp detection
    const thermal = await this.getBatteryAndThermal(robotId);
    const thermalData = thermal?.data as any;
    if (thermalData?.temperature && thermalData.temperature > 40) {
      anomalies.push({
        type: 'HIGH_TEMPERATURE',
        severity: 'error',
        message: `Core temperature critical: ${thermalData.temperature}°C`,
      });
    }

    return anomalies;
  }
}

export const ros2TelemetryEngine = new ROS2TelemetryEngine();
