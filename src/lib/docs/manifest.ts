export interface DocSection {
  id: string;
  title: string;
  content: string;
}

export interface DocCategory {
  id: string;
  category: string;
  sections: DocSection[];
}

export const DocumentationManifest: DocCategory[] = [
  {
    id: "manuscript",
    category: "The Manuscript",
    sections: [
      {
         id: "platform-architecture",
         title: "Platform Architecture",
         content: `
# InfraConnect Plexus Architecture
The Sovereign AI platform is an institutional-grade, zero-trust edge routing engine designed to process telemetry, cognitive models, and hardware loops concurrently without traditional cloud-bottleneck latency.

### Core Topologies
1. **The Tactical Control Plane**: A React-Three-Fiber powered GPU dashboard executing at 60fps, synchronizing mission overrides, and FleetSafe visual maps.
2. **The Nexus Engine**: Real-time ROS (Robot Operating System) bindings translated into WebSockets over port \`9090\` spanning edge devices.
3. **Data Vault Foundation**: Palantir-styled persistent metric graphing layer routing metrics seamlessly bypassing conventional HTTP bounds.

### Security Model
The system enforces strict RBAC (Role-Based Access Control) using stateless JWTs. Tactical interlocks prevent accidental autonomy triggers unless the global "Armed" sequence is explicitly initiated by a Tier 1 Commander.
         `
      },
      {
         id: "fleetsafe-vla",
         title: "FleetSafe VLA Engine",
         content: `
# FleetSafe-VLA: The Autonomy Foundation

The Sovereign OS runs the cutting-edge **FleetSafe Vision-Language-Action (VLA)** Engine. This architecture guarantees delay-robust physical safety by processing visual data into kinetic bounds locally.

### Capabilities Matrix
- **Zero-Shot Object Avoidance**: Dynamically computes trajectory deviations based on depth camera frames using internal SLAM mapping algorithms.
- **Cognitive Bounds Check**: Synthesizes human-in-the-loop task commands and mathematically computes physical constraints prior to hardware execution.
- **Latency Floor**: By dropping cloud round-trips for kinetic evaluation, the FleetSafe module ensures a <5ms response floor to imminent hazard detections.

### Mathematical Postulates
All algorithms depend on Control Barrier Functions (CBFs). 
Let $h(x,t)$ be the safety envelope. We require $B(x) \ge 0$ unconditionally across all unverified environments.
         `
      }
    ]
  },
  {
    id: "how-to",
    category: "Operational Directives",
    sections: [
      {
         id: "mission-deployment",
         title: "Initiating a Mission",
         content: `
# Initiating a Core Mission

Deploying autonomous nodes involves bypassing standard idle limits and configuring the edge routers.

1. **Verify Edge Uplink**: Ensure your ROS targets (RBT-01, HUM-04) are displaying "LIVE" in the Nexus telemetry dashboard.
2. **Arm the Interlock**: Expand the \`TacticalSettingsBar\` on the far right. Use the **Master Disarm/Arm** toggle to authorize kinetic capabilities.
3. **Set Parameters**: Adjust the *AI Aggression* slider. A higher percentage sacrifices battery limits for faster completion thresholds.
4. **Broadcast Target**: Drag nodes in the DAG engine or assign manual grid coordinates on the 3D map.

> **Caution**: For safety, never initiate autonomous fleet deployments if localized ROS WebSocket loops are suffering dropped pings > 2%.
         `
      },
      {
         id: "settings-calibration",
         title: "Calibrating Platform Settings",
         content: `
# Global Settings & Parameters

The platform operates on a complex grid of constraints balancing AI cognition, hardware lifespan, and mission efficiency.

### AI Aggression (0-100%)
- **Merciful (0-30%)**: Extremely cautious. Prioritizes massive safety distances and minimal battery drain. 
- **Balanced (30-70%)**: Industry standard operating parameters. 
- **Ruthless (70-100%)**: Sacrifices hardware wear and power usage for absolute mission completion. Avoidance bounds are drastically minimized.

### Battery Floors
Sets the threshold (e.g. 30%) at which an edge node will automatically abort missions and initiate a return-to-base (RTB) algorithm regardless of operational objectives.
         `
      }
    ]
  },
  {
    id: "troubleshooting",
    category: "Troubleshooting",
    sections: [
      {
         id: "websocket-ros",
         title: "ROS Socket Disconnects",
         content: `
# Debugging ROS Bridge Disconnects

If you see \`(STANDBY)\` or endless connection errors on port \`9090\`, the edge ROS environment is disconnected.

### Standard Resolution Path
1. Confirm the backend \`roscore\` daemon is active via the edge CLI.
2. Validate \`rosbridge_server\` is booted on target devices.
3. Check the client browser console. If you see CORS errors, ensure your proxy or NGINX layers are configured to upgrade \`HTTP\` to \`WS\`.

### Next.js Fast Refresh Anomalies
Sometimes, Next.js \`HMR\` will drop the socket state. If the \`EffectComposer\` crashes due to buffer loss, refresh the browser manually to hard-reset the socket queues.
         `
      },
      {
         id: "network-layer",
         title: "Diagnosing 500 API Errors",
         content: `
# 500 API Route Failures

If internal APIs drop (e.g. \`api/telemetry\`), check the server output.
Most commonly, this happens if Prisma is bundled improperly by Turbopack or Redis drops internal polling.

**Emergency Quick Fix:**
1. Execute a graceful shutdown: \`npm run kill-daemon\`.
2. Clear the Node compilation mappings: \`rm -rf .next/\`.
3. Reignite the core server: \`npm run dev\`.
         `
      }
    ]
  },
  {
    id: "support",
    category: "Support & Enterprise",
    sections: [
      {
         id: "hardware-support",
         title: "Hardware Warranties & Node Resets",
         content: `
# Edge Hardware Support

The InfraConnect protocol assumes liability for logical bounds operations, but Edge hardware warranties (LiDAR mounts, Drive tracks, and Sensors) are bound to your SLA.

### Purging Erroneous Nodes
If a hardware node gets "stuck" due to corrupt memory bounds, utilize the **EMERGENCY HARDWARE RESET** toggle in the bottom right of the operator HUD. This conducts a bare-metal remote wipe on the edge device memory space and forces a fresh reboot sequence.

For replacement authorizations, contact \`founder@infraconnect.ai\`.
         `
      }
    ]
  }
];
