import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding VLA demo data...');

  // Create a demo Isaac Lab run
  const demoRun = await prisma.isaacLabRun.upsert({
    where: { id: 'demo-vla-run-001' },
    update: {},
    create: {
      id: 'demo-vla-run-001',
      experimentId: 'wandb-exp-vla-demo',
      status: 'RUNNING',
      sceneUsd: 'assets/Isaac-Lift-Cube-v0.usd',
      numEnvs: 512,
      domainRandomization: { friction: [0.5, 1.2], lighting: 'random' },
      physicsScoreAvg: 0.87,
      dataQualityScoreAvg: 0.79,
      highLossCount: 47,
      prunedCount: 12,
      startedAt: new Date(Date.now() - 1000 * 60 * 45),
    },
  });

  // Create sample episodes
  const episodesData = Array.from({ length: 24 }, (_, i) => ({
    runId: demoRun.id,
    episodeIndex: 1200 + i,
    physicsRealism: 0.75 + Math.random() * 0.22,
    sensorFidelity: 0.68 + Math.random() * 0.28,
    languageGrounding: 0.71 + Math.random() * 0.25,
    actionSuccess: 0.65 + Math.random() * 0.3,
    modelLoss: 1.2 + Math.random() * 1.8,
    cleanlabConfidence: 0.55 + Math.random() * 0.4,
    overallQualityScore: 0.72 + Math.random() * 0.25,
    isPruned: Math.random() < 0.12,
    pruneReason: Math.random() < 0.12 ? 'Low physics realism' : null,
  }));

  await prisma.physicsEpisode.createMany({
    data: episodesData,
    skipDuplicates: true,
  });

  console.log('✅ VLA demo data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
