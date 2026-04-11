import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Database...')

  await prisma.memoryNode.deleteMany({});
  await prisma.healthProjection.deleteMany({});
  await prisma.dashboardProjection.deleteMany({});
  await prisma.governanceProjection.deleteMany({});
  await prisma.activityProjection.deleteMany({});
  await prisma.agentBusProjection.deleteMany({});
  await prisma.personaProjection.deleteMany({});
  await prisma.benchmarkProjection.deleteMany({});
  await prisma.runtimeProjection.deleteMany({});

  // Create core projections required for UI consistency
  await prisma.healthProjection.create({
    data: {
      id: "singleton",
      overall: 95,
      policyVersion: "health-v3",
      coverage: 100,
      conflictDensity: 6,
      staleness: 0,
      redundancy: 0,
      byLevel: { "L0": 2, "L1": 4, "L2": 4 },
      byPlane: { "execution": 3, "memory": 4, "governance": 3 },
      sourceEventId: "evt_seed",
    }
  });

  await prisma.dashboardProjection.create({
    data: {
      id: "singleton",
      totalNodes: 10,
      completedSkills: 2,
      canonicalKnowledge: 4,
      scratchItems: 2,
      wikiEntries: 4,
      activeConflicts: 0,
      planeCounts: { "execution": 3, "memory": 4, "governance": 3 },
      levelCounts: { "L0": 2, "L1": 4, "L2": 4 },
      busStatus: "live",
      busConnections: 2,
      sourceEventId: "evt_seed",
    }
  });

  await prisma.governanceProjection.create({
    data: {
      id: "singleton",
      canonCount: 4,
      wikiCount: 4,
      scratchCount: 2,
      promotionPipeline: { "scratch": 2, "wiki": 1, "canon": 0 },
      pendingPromotions: [
        {
          nodeId: "n_sensor_fusion",
          title: "Sensor Fusion Best Practices",
          level: "L1",
          score: 0.95,
          actions: ["promote_to_canon", "reject_to_scratch"]
        }
      ],
      decayTimeline: {
        scratchTtlDays: 7,
        tacticalTtlDays: 30,
        canonRevalidationDays: 90,
        scratchExpiredCount: 0,
        tacticalExpiredCount: 0,
        canonDueCount: 0
      },
      sourceEventId: "evt_seed",
    }
  });

  await prisma.activityProjection.create({
    data: {
      id: "singleton",
      eventCount: 5,
      recentEvents: [],
      sourceEventId: "evt_seed",
    }
  });

  await prisma.agentBusProjection.create({
    data: {
      id: "singleton",
      status: "live",
      uptimeSeconds: 3600,
      connectionCount: 1,
      topicCount: 4,
      subscriptionCount: 12,
      recentMessages: [],
      subscriptions: ["memory.#", "skill.#", "system.#", "governance.#"],
      sourceEventId: "evt_seed",
    }
  });

  await prisma.personaProjection.create({
    data: {
      id: "singleton",
      activeSession: {
        id: "ps_1",
        role: "Mission Commander",
        status: "listening",
        endpoint: "ws://localhost:8998",
        transport: "ws",
        actorId: "operator"
      },
      availableRoles: ["Mission_Commander", "Safety_Auditor", "Research_Copilot", "Executive_Assistant"],
      sourceEventId: "evt_seed",
    }
  });

  await prisma.benchmarkProjection.create({
    data: {
      id: "singleton",
      benchmark: "CaP_X",
      ablationMode: false,
      loaded: false,
      episodes: [],
      sourceEventId: "evt_seed",
    }
  });

  await prisma.runtimeProjection.create({
    data: {
      id: "singleton",
      profile: "L2-STRICT",
      enforcing: true,
      permittedCount: 0,
      blockedCount: 0,
      recentIntercepts: [],
      sourceEventId: "evt_seed",
    }
  });

  // Create demo MemoryNodes to fit the requested Orthogonal Ontology
  const nodes = [
    {
      shortId: "n1", slug: "vla-safety-requirements-v2-1", title: "VLA Safety Requirements v2.1",
      level: "L2", plane: "governance", kind: "standard", state: "canonical",
      summary: "Strict bounds for hospital corridor deployment", tags: ["safety", "vla"], createdBy: "sys"
    },
    {
      shortId: "n2", slug: "sim-to-real-transfer-playbook", title: "Sim-to-Real Transfer Playbook",
      level: "L2", plane: "governance", kind: "playbook", state: "canonical",
      summary: "Domain randomization tactics", tags: ["sim", "real"], createdBy: "sys"
    },
    {
      shortId: "n3", slug: "sensor-fusion-best-practices", title: "Sensor Fusion Best Practices",
      level: "L2", plane: "governance", kind: "standard", state: "canonical",
      summary: "Multimodal fusion weighting", tags: ["perception"], createdBy: "sys"
    },
    {
      shortId: "n4", slug: "release-criteria-for-vla-v3-0", title: "Release Criteria for VLA v3.0",
      level: "L2", plane: "governance", kind: "standard", state: "canonical",
      summary: "Release gate checklist", tags: ["release"], createdBy: "sys"
    },
    {
      shortId: "n5", slug: "vla-project-alpha-spec-draft", title: "VLA Project Alpha - Spec Draft",
      level: "L1", plane: "memory", kind: "project", state: "draft",
      summary: "First generation architecture", tags: ["architecture"], createdBy: "sys"
    },
    {
      shortId: "n6", slug: "build-log-2847", title: "Build Log #2847",
      level: "L0", plane: "execution", kind: "artifact", state: "active",
      summary: "Failed Jenkins output", tags: ["ci"], createdBy: "sys"
    }
  ];

  for (const n of nodes) {
    await prisma.memoryNode.create({
      // @ts-ignore - enum values are fully cast
      data: n
    })
  }

  console.log('Seeding Complete ✅')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
