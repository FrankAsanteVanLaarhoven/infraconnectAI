/**
 * Unified Edge Payload Definitions
 */
export type CommandPayload = {
  robot_id: string;
  action: string;
  payload: Record<string, any>;
  ts: number;
};

export type TelemetryPayload = {
  robot_id: string;
  battery: number;
  status: string;
  pose: { x: number; y: number; z: number; [key: string]: any };
  source: "real" | "simulation";
};

/**
 * Foundation for Decoupled Edge Abstraction.
 * Ensures the Control Plane never couples directly into a proprietary Hardware SDK.
 */
export interface RobotAdapter {
  /**
   * Translates an abstract Cloud Command (e.g. {action: "MOVE", payload: {x: 1}}) 
   * into the proprietary UDP / ROS / gRPC transmission geometry strictly for the edge node.
   */
  sendCommand(cmd: CommandPayload): Promise<void>;

  /**
   * Fetches internal hardware readings safely and shapes them cleanly into the 
   * unified `TelemetryPayload` definition for Redis ingestion.
   */
  getTelemetry(): Promise<TelemetryPayload>;
}

/**
 * Example Unitree Architecture Stub
 */
export class UnitreeG1Adapter implements RobotAdapter {
  async sendCommand(cmd: CommandPayload): Promise<void> {
    // Inject UDP target abstraction code mapping natively to the Unitree local APIs
    console.log(`[UnitreeG1] SDK Binding Fired: ${cmd.action}`);
  }

  async getTelemetry(): Promise<TelemetryPayload> {
    // Stub simulating raw physical UDP responses from the G1 joint motors
    return {
      robot_id: "unitree-01",
      battery: 81.4,
      status: "ACTIVE",
      pose: { x: 0.1, y: 0.0, z: 0.0 },
      source: "real"
    };
  }
}
