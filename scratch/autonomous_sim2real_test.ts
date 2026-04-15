async function testSimToRealDeploy() {
  console.log("🚀 Initializing AUTONOMOUS SIM-TO-REAL INTEGRATION TEST...");
  
  const fakePayload = {
    version: 'autonomous-policy-rc-1.onnx',
    storageUri: 's3://zerogate-models/autonomous-policy.onnx',
    targetTier: 'SIM_L0',
    pipelineStage: 'SIM_L0_BASELINE',
    hardwareTarget: 'UNITREE_G1',
    autoPromote: true,
    manifestData: { arch: "arm64", framework: "PyTorch" },
    checksum: "sha256-verified-auto"
  };

  try {
    const res = await fetch('http://localhost:3006/api/ota', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fakePayload)
    });

    const data = await res.json();
    console.log(`📡 Response Status: ${res.status}`);
    console.log(`📦 Response Payload:`, data);

    if (data.success && data.totalCascades === 3) {
      console.log("✅ FULL AUTONOMOUS TEST PASSED: SVR Cascade Logic verified 3 stages automatically (L0 -> L1 -> Real)!");
    } else {
      console.log("❌ AUTONOMOUS TEST FAILED: Pipeline did not cascade correctly.");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ CRITICAL NETWORK FAILURE:", error);
    process.exit(1);
  }
}

testSimToRealDeploy();
