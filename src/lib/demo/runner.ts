import { bus, tacticalBus } from "@/lib/events/bus";
import { demoTimeline } from "./timeline";

function executeAction(action: string) {
  console.log(`[CINEMATIC_ENGINE] Executing Hook: ${action}`);

  switch (action) {
    case "focus_robot":
      bus.emit("robot.commands" as any, { action: "CAMERA_MODE", mode: "follow" });
      break;

    case "start_mission":
      // Inject standard Demo execution payload wrapper
      bus.emit("tasks.created" as any, { 
          robots: [
              { id: "humanoid-01", position: [0,0,0], battery: 85, status: "idle" },
              { id: "humanoid-02", position: [4,0,2], battery: 92, status: "idle" }
          ], 
          tasks: [
              { id: "DEMO_INSPECT", type: "inspect", target: [6,0,6], priority: 1 }
          ] 
      });
      break;

    case "inject_failure":
      tacticalBus.dispatch({ type: "HARDWARE_ANOMALY", payload: { nodeId: "humanoid-01", temp: 104, vram: 98 } });
      break;
      
    case "agent_response":
      bus.emit("infraconnect:toast" as any, { title: "Agent Engaged", message: "Rerouting execution matrix due to Thermal cascade." });
      break;
      
    case "recovery":
      // Resolve error constraints and resume operations natively 
      tacticalBus.dispatch({ type: "MISSION_PURGE", payload: { bufferId: "humanoid-01" } });
      break;
  }
}

export function runDemo() {
  demoTimeline.forEach(step => {
    setTimeout(() => {
      executeAction(step.action);
    }, step.t * 1000);
  });
}
