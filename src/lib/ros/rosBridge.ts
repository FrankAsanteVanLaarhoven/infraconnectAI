import ROSLIB from "roslib";

/**
 * Enterprise Isaac Sim -> Web Hardware Bridge
 */
export function commandVel(ros: any, linear: {x:number, y:number, z:number}, angular: {z:number}) {
    if(!ros) return;
    
    try {
        const cmd = new ROSLIB.Topic({
            ros,
            name: "/cmd_vel",
            messageType: "geometry_msgs/Twist"
        });

        cmd.publish({
            linear,
            angular: { x: 0, y: 0, z: angular.z }
        });
    } catch(e) {
        console.error("Isaac integration isolated locally - rosBridge failed to publish.");
    }
}
