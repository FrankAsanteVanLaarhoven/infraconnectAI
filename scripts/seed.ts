const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("Initiating CORE Physical Matrix Injection...");

  // 1. Purge Old Vectors
  await prisma.memoryEdge.deleteMany({});
  await prisma.memoryNode.deleteMany({});
  await prisma.operationalViolation.deleteMany({});

  await prisma.safetyDirective.deleteMany({});
  await prisma.agentLifecycleRun.deleteMany({});
  await prisma.benchmarkEpisode.deleteMany({});
  await prisma.benchmarkProjection.deleteMany({});
  await prisma.anomaly.deleteMany({});
  await prisma.earthInsight.deleteMany({});
  await prisma.acquisitionSlot.deleteMany({});
  await prisma.agentIncident.deleteMany({});
  await prisma.fleetNode.deleteMany({});
  await prisma.agentRegistration.deleteMany({});

  // 2. Establish Base Overlord Agent
  const agent = await prisma.agentRegistration.create({
    data: {
      slug: 'nexus-overlord',
      displayName: 'The Central Autonomic Matrix',
      agentType: 'SUPERVISOR',
      deployTier: 'CORE_EDGE',
      orgId: 'ORG_GLOBAL_1',
      policyProfileId: 'STRICT_ZERO_TRUST'
    }
  });

  // 3. Inject Global Geospatial Fleet Nodes
  const hubs = [
    { baseLat: 37.7749, baseLng: -122.4194 },
    { baseLat: 40.7128, baseLng: -74.0060 },
    { baseLat: 51.5074, baseLng: -0.1278 },
    { baseLat: 35.6762, baseLng: 139.6503 },
    { baseLat: -33.8688, baseLng: 151.2093 }
  ];

  const nodesToInsert = [];
  for (let i = 0; i < 150; i++) {
    const hub = hubs[Math.floor(Math.random() * hubs.length)];
    const latJitter = (Math.random() - 0.5) * 8.0;
    const lngJitter = (Math.random() - 0.5) * 12.0;
    
    nodesToInsert.push({
      robotId: `NODE_${crypto.randomUUID()}`,
      alias: `EDGE_SERVE_${i}`,
      latitude: hub.baseLat + latJitter,
      longitude: hub.baseLng + lngJitter,
      memoryBytes: Math.floor(Math.random() * 5 + 1),
      status: Math.random() > 0.1 ? 'online' : 'degraded',
      anomalyCount: Math.floor(Math.random() * 3)
    });
  }

  await prisma.fleetNode.createMany({ data: nodesToInsert });
  const createdNodes = await prisma.fleetNode.findMany({ take: 20 });

  // 4. Inject Tactical Threats & Anomalies
  for (const node of createdNodes) {
    if (node.anomalyCount > 0) {
      await prisma.anomaly.create({
        data: {
          nodeId: node.id,
          severity: 'warn',
          type: 'memory_leak',
          description: `Resource exhaustion detected on ${node.alias}`
        }
      });
      
      // Also create an Incident for the Intercepts stream
      await prisma.agentIncident.create({
        data: {
          agentId: agent.id,
          severity: 'QUARANTINED',
          category: 'SQL_INJECTION',
          description: `NODE_${node.robotId.substring(0,8)} triggered heuristic alert.`
        }
      });
    }
  }

  // Add some specific high-fidelity incidents
  const threatPayloads = [
    { desc: "192.17.74.146", cat: "MALWARE_SYNC", sev: "QUARANTINED" },
    { desc: "192.73.12.237", cat: "BRUTE_FORCE", sev: "BANNED" },
    { desc: "192.23.74.12", cat: "EXFILTRATION", sev: "BANNED" }
  ];

  for (const t of threatPayloads) {
    await prisma.agentIncident.create({
      data: {
        agentId: agent.id,
        severity: t.sev,
        category: t.cat,
        description: t.desc
      }
    });
  }


  // 5. Inject Safety Directives & Verification Gates
  const directives = [
    { name: 'safety_check', severity: 'hard', domain: 'system' },
    { name: 'sec_audit', severity: 'hard', domain: 'system' },
    { name: 'nav_safety', severity: 'hard', domain: 'navigation' },
    { name: 'manip_safety', severity: 'hard', domain: 'manipulation' },
    { name: 'perc_safety', severity: 'hard', domain: 'perception' },
    { name: 'perf_bench', severity: 'optional', domain: 'performance' },
    { name: 'privacy_gate', severity: 'critical', domain: 'compliance' }
  ];

  for (const d of directives) {
    const directive = await prisma.safetyDirective.create({ 
      data: {
        ...d,
        lastTestedAt: d.severity === 'hard' ? new Date() : null
      } 
    });
  }



  // 6. Inject Agent Lifecycle Runs
  const runs = [
    { environment: 'PRODUCTION', status: 'completed', successRate: 0.98, avgDeadlineMs: 42.5, deadlineSatisfied: true, completedAt: new Date() },
    { environment: 'EDGE', status: 'executing', successRate: 0.85, avgDeadlineMs: 120.2, deadlineSatisfied: false, completedAt: new Date() },
    { environment: 'DEV_STABLE', status: 'verifying', successRate: 0.92, avgDeadlineMs: 55.1, deadlineSatisfied: true, completedAt: new Date() }
  ];


  for (const r of runs) {
    await prisma.agentLifecycleRun.create({ data: r });
  }

  // 7. Inject Performance Benchmarks
  await prisma.benchmarkProjection.create({
    data: {
      id: "singleton",
      benchmark: 'IndustrialStandard',
      loaded: true,
      taskSuccess: 0.94,
      policyViolations: 0.02,
      autoRecovery: 0.12,
      abstractionLayer: 'S4',
      episodes: [],
      sourceEventId: "seed-init-v2",
      generatedAt: new Date()
    }
  });

  const benchmarkData = [
    { taskId: 'SIG_OP_1', abstractionLayer: 'S4', status: 'passed', success: true, policyViolationCount: 0, recoveryCount: 0 },
    { taskId: 'SIG_OP_2', abstractionLayer: 'S3', status: 'recovered', success: true, policyViolationCount: 1, recoveryCount: 1 },
    { taskId: 'SIG_OP_3', abstractionLayer: 'S4', status: 'passed', success: true, policyViolationCount: 0, recoveryCount: 0 },
    { taskId: 'SIG_OP_4', abstractionLayer: 'S4', status: 'passed', success: true, policyViolationCount: 0, recoveryCount: 0 }
  ];

  for (const b of benchmarkData) {
    await prisma.benchmarkEpisode.create({
      data: {
        ...b,
        shortId: Math.random().toString(36).substring(2, 8),
        benchmark: 'IndustrialStandard',
        suite: 'CORE_VALIDATION',
        importedAt: new Date()
      }
    });
  }


  // 8. Inject World Intelligence insights for Nexus HUD
  await prisma.earthInsight.create({
    data: {
      category: 'DISASTER',
      title: 'Sierra Sector Ignition',
      content: 'Thermal sweep detected core ignition in Sector 4. Coordinates locked.',
      priority: 'emergency',
      coordinates: [37.7, -119.5],
      ts: new Date()
    }
  });

  await prisma.acquisitionSlot.create({
    data: {
      targetName: 'Hormuz Tanker Hub',
      aoi: 'Sector-H Alpha',
      sensorType: 'SAR',
      status: 'in_progress',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      priority: 1
    }
  });

  // 9. Inject Memory Stratum Nodes for Governance Cycle
  const memoryNodes = [
    { 
      shortId: 'K-928', 
      slug: 'navigation-prime-standard', 
      title: 'Navigation Optimal Path Standard', 
      level: 'L2', 
      plane: 'governance', 
      kind: 'standard', 
      state: 'active', 
      createdBy: 'nexus-overlord',
      promotionScore: 0.95,
      confidence: 0.99
    },
    { 
      shortId: 'K-929', 
      slug: 'system-latency-threshold', 
      title: 'System Latency Hard Threshold', 
      level: 'L1', 
      plane: 'execution', 
      kind: 'policy', 
      state: 'pending_promotion', 
      createdBy: 'nexus-overlord',
      promotionScore: 0.88,
      confidence: 0.92
    },
    { 
      shortId: 'K-930', 
      slug: 'raw-telemetry-anomaly-012', 
      title: 'Raw Signal Anomaly #012', 
      level: 'L0', 
      plane: 'memory', 
      kind: 'artifact', 
      state: 'draft', 
      createdBy: 'nexus-overlord',
      promotionScore: 0.45,
      confidence: 0.60
    }
  ];

  for (const n of memoryNodes) {
    await prisma.memoryNode.create({ data: n });
  }

  console.log("CORE Matrix Seeding Complete. 150 Nodes, 4 Directives, 20 Benchmarks, 3 Memory Nodes and World Intel established.");

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

