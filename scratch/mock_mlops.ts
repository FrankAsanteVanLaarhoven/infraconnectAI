import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding MLOps Data...");

  const mockRewardData = [
    { episode: 0, reward: -100, svr: 0.8 },
    { episode: 50, reward: -50, svr: 0.6 },
    { episode: 100, reward: 20, svr: 0.4 },
    { episode: 150, reward: 85, svr: 0.2 },
    { episode: 200, reward: 140, svr: 0.05 },
    { episode: 250, reward: 190, svr: 0.01 },
    { episode: 300, reward: 210, svr: 0.0 },
  ];

  await prisma.mL_Experiment.create({
    data: {
      modelName: "VLA-Humanoid-Core-1.0",
      runTag: "SIM-EVAL-Beta",
      hyperparameters: { learningRate: 0.0003, batchSize: 512, optimizer: "AdamW" },
      rewardCurves: mockRewardData,
      svrRate: 0.01
    }
  });

  console.log("MLOps Data Seeded Successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
