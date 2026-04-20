"use client";

import { useEffect, useState } from "react";
// Provide static mock or bypass for local TS environment if package fails
import ROSLIB from "roslib";

export function useROS() {
  const [ros, setRos] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [joints, setJoints] = useState<any>({});
  const [pose, setPose] = useState<any>(null);

  useEffect(() => {
    // Graceful fallback for environments not yet fully packaged
    if (typeof window === "undefined" || !ROSLIB) return;

    try {
      const rosInstance = new ROSLIB.Ros({
        url: "ws://localhost:9090", // rosbridge
      });

      rosInstance.on("connection", () => setConnected(true));
      rosInstance.on("close", () => setConnected(false));
      rosInstance.on("error", () => setConnected(false)); // Error containment

      // Joint states
      const jointSub = new ROSLIB.Topic({
        ros: rosInstance,
        name: "/joint_states",
        messageType: "sensor_msgs/JointState",
      });

      jointSub.subscribe((msg: any) => {
        const mapped: any = {};
        msg.name.forEach((n: string, i: number) => {
          mapped[n] = msg.position[i];
        });
        setJoints(mapped);
      });

      // Pose (example)
      const poseSub = new ROSLIB.Topic({
        ros: rosInstance,
        name: "/robot_pose",
        messageType: "geometry_msgs/Pose",
      });

      poseSub.subscribe(setPose);

      setRos(rosInstance);

      return () => {
        try {
          rosInstance.close();
        } catch(e) {}
      }
    } catch(err) {
      console.warn("ROS Bridge not spun up natively on 9090 yet.", err);
    }
  }, []);

  return { ros, connected, joints, pose };
}
