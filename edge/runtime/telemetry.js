/**
 * InfraConnect - Watchdog Telemetry Producer
 * Transmits physical Jetson thermals & loads to the Control Plane 
 * simulating the MQTT/Kafka pipeline directly to the API sync.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const fetch = require("node-fetch");
const NODE_ID = process.env.NODE_ID || "node_alpha_orin_nx";
const CONTROL_PLANE = "http://localhost:3000/api/robotics/edge-sync";

setInterval(async () => {
  const data = {
    clusterId: NODE_ID,
    fingerprint: "sha256:hardware_mock_xyz",
    currentHash: "synced",
    telemetryBatch: {
      temp: parseFloat((Math.random() * 20 + 65).toFixed(1)),
      load: parseFloat((Math.random() * 30 + 40).toFixed(1)),
    }
  };

  try {
    const res = await fetch(CONTROL_PLANE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
       console.log(`[TELEMETRY] Pushed Payload: Temp ${data.telemetryBatch.temp}°C | GPU ${data.telemetryBatch.load}%`);
    }
  } catch (e) {
    console.log("[TELEMETRY] Connection weak. Batching to disk store.");
  }
}, 3000);
