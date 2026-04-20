import { publish, subscribe } from "@/lib/core/bus";

export async function executeMission(payload: any) {
  if (payload.type === "EXECUTE_PARAMS") {
      // Offload to cloud intelligence API
      await fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              agent: "mission-planner",
              decision: "Execute constraints",
              constraints: payload.constraints
          })
      });
      return;
  }

  // Fallback for visual graph node step execution
  if (payload.nodes) {
      for (const node of payload.nodes) {
        publish("mission.node.start", { node });
        await runNode(node);
        publish("mission.node.complete", { node });
      }
  }
}

async function runNode(node: any) {
  switch (node.data.label) {
    case "Detect":
      publish("robot.scan", {});
      break;

    case "Plan":
      publish("tasks.announced", {
        task: { id: "DAG_AUTO", target: [6, 6], priority: 1, type: "inspect" },
      });
      break;

    case "Act":
      publish("robot.commands", { action: "CAMERA_MODE", mode: "cinematic" });
      break;
  }

  await new Promise((r) => setTimeout(r, 2000));
}

subscribe("mission.execute", async (e: any) => {
  await executeMission(e);
});

