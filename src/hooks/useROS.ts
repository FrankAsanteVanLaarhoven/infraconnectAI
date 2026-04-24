"use client";

import { useEffect, useState } from "react";
// Provide static mock or bypass for local TS environment if package fails
import ROSLIB from "roslib";

export function useROS() {
  const [ros, setRos] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Graceful fallback for environments not yet fully packaged
    if (typeof window === "undefined" || !ROSLIB) return;

    // Disable ROS bridge connection in production to prevent WebSocket crashes.
    // In production on Vercel, localhost:9090 is not available.
    if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
      setConnected(false);
      return;
    }

    try {
      const rosInstance = new ROSLIB.Ros({
        url: "ws://localhost:9090", // rosbridge
      });

      rosInstance.on("connection", () => setConnected(true));
      rosInstance.on("close", () => setConnected(false));
      rosInstance.on("error", () => setConnected(false)); // Error containment

      setRos(rosInstance);

      return () => {
        try {
          if (rosInstance.isConnected) {
            rosInstance.close();
          }
        } catch(e) {}
      }
    } catch(err) {
      console.warn("ROS Bridge not spun up natively on 9090 yet.", err);
    }
  }, []);

  return { ros, connected };
}
