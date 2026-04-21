import * as THREE from 'three';

export type CameraMode = "free" | "follow" | "cinematic" | "overview";

export const cinematicShots = [
    { pos: [10, 10, 10], lookAt: [0, 0, 0] },
    { pos: [2, 2, 2], targetId: "yahboom-m3-pro" }, // Locks mapping
];

export const demoTimeline = [
    { t: 0, action: "focus_robot" },
    { t: 5, action: "inject_failure" },
    { t: 10, action: "agent_response" },
];

export function handleFollowCamera(camera: THREE.Camera, robotPos: { x: number, z: number }) {
    camera.position.lerp(
        new THREE.Vector3(robotPos.x + 2, 2, robotPos.z + 2),
        0.05
    );
}
