import { Robot, Task } from "./types";

function distance(posA: [number, number, number], posB: [number, number, number]) {
  const dx = posA[0] - posB[0];
  const dy = posA[1] - posB[1];
  const dz = posA[2] - posB[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function allocateTasks(robots: Robot[], tasks: Task[]) {
  const assignments = [];

  for (const task of tasks) {
    let bestRobot: Robot | null = null;
    let bestCost = Infinity;

    for (const robot of robots) {
      if (robot.status !== "idle") continue;

      const dist = distance(robot.position, task.target);

      // Multi-variable heuristic mappings (Cost Auction)
      const batteryPenalty = robot.battery < 30 ? 100 : 0;
      
      // Cost mapping based purely on logistics vs urgency
      const cost = dist + batteryPenalty - (task.priority * 10);

      if (cost < bestCost) {
        bestCost = cost;
        bestRobot = robot;
      }
    }

    if (bestRobot) {
      assignments.push({
        robot_id: bestRobot.id,
        task_id: task.id,
      });

      // Synchronously lock state locally
      bestRobot.status = "busy";
    }
  }

  return assignments;
}
