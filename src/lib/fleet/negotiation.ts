import { publish } from "@/lib/core/bus";
import { Task } from "./types";

export function announceTask(task: Task) {
  publish("tasks.announced", { task });
}
