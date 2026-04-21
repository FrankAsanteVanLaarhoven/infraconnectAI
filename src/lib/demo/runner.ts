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
              { id: "yahboom-m3-pro", position: [0,0,0], battery: 85, status: "idle" }
          ], 
          tasks: [
              { id: "DEMO_INSPECT", type: "inspect", target: [6,0,6], priority: 1 }
          ] 
      });
      break;

    case "inject_failure":
      tacticalBus.dispatch({ type: "HARDWARE_ANOMALY", payload: { nodeId: "yahboom-m3-pro", temp: 104, vram: 98, error: "DABAI DCW2 Occlusion" } });
      break;
      
    case "agent_response":
      bus.emit("infraconnect:toast" as any, { title: "Dual-Model Intervention", message: "Rerouting execution logic to secondary vision framework." });
      break;
      
    case "recovery":
      // Resolve error constraints and resume operations natively 
      tacticalBus.dispatch({ type: "MISSION_PURGE", payload: { bufferId: "yahboom-m3-pro" } });
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
