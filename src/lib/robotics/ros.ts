import ROSLIB from "roslib";

/**
 * Global synchronous WebSocket bridging natively executing against Isaac Sim 
 * or explicit generic robot host bounds seamlessly natively.
 */
let ros: ROSLIB.Ros | null = null;

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    // We strictly limit instantiation to the client natively completely successfully preventing SSR Node failures.
    ros = new ROSLIB.Ros({
      url: "ws://localhost:9090", // Explicit host bounds mapping out physical node targets natively.
    });
}

export { ros };

// Structural Joint controller hooking explicit `useFrame` arrays directly onto ROS messages
export function sendJointState(joints: Record<string, number>) {
  if (!ros || !ros.isConnected) return;
  
  const topic = new ROSLIB.Topic({
    ros,
    name: "/joint_states_cmd",
    messageType: "sensor_msgs/JointState",
  });

  topic.publish({
    name: Object.keys(joints),
    position: Object.values(joints),
  });
}
