"use client";

import ROSLIB from "roslib";
import { useEffect, useState } from "react";

/**
 * Native SLAM / AMCL Ingestion Vector.
 * Bypasses explicit mapping endpoints and translates raw OccupancyGrid Arrays.
 */
export function useMap(ros: any) {
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    if (!ros) return;

    try {
        const sub = new ROSLIB.Topic({
            ros,
            name: "/map",
            messageType: "nav_msgs/OccupancyGrid",
        });

        sub.subscribe(setMap);

        return () => sub.unsubscribe();
    } catch(err) {
        console.warn("ROS Bridge unavailable for precise Map ingestions", err);
    }
  }, [ros]);

  return map;
}
