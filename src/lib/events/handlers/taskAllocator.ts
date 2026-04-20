import { allocateTasks, Robot, Task } from "@/lib/fleet/allocator";
import { bus } from "@/lib/events/bus";

export async function onTasksCreated(event: { robots: Robot[], tasks: Task[] }) {
  const { robots, tasks } = event;

  // Real-time assignment via Cost-Based Auction Model
  const assignments = allocateTasks(robots, tasks);

  for (const a of assignments) {
      console.log(`[ALLOCATOR] Task assigned → Robot ${a.robot_id} (Target Node: ${a.task_id})`);
      
      // Dispatching operational commands natively through the UI layer 
      bus.emit("robot.commands" as any, {
          robot_id: a.robot_id,
          action: "EXECUTE_TASK",
          task_id: a.task_id,
      });
  }
}
