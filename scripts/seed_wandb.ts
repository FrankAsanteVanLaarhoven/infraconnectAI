import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  console.log("Seeding test run for Weights & Biases...");
  
  // Create a realistic ML Experiment showing SOTA reduction in SVR over episodes
  const curves = [];
  let currentLoss = 2.5;
  let currentReward = 0;
  
  for (let i = 0; i < 50; i++) {
    curves.push({
      episode: i,
      loss: currentLoss,
      reward: currentReward
    });
    // simulate learning curve
    currentLoss = currentLoss * 0.95;
    currentReward += Math.random() * 5 + 2;
  }

  await db.mL_Experiment.create({
    data: {
      modelName: "Gemma-4-31B-VLA",
      runTag: "sota-fleet-test-" + Date.now().toString().slice(-4),
      hyperparameters: JSON.stringify({
        learningMethod: "RLHF",
        batchSize: 2048,
        learningRate: 3e-5,
        quantization: "4-bit TurboQuant"
      }),
      rewardCurves: JSON.stringify(curves),
      svrRate: 0.0001, // Near zero SVR
    }
  });

  console.log("Test experiment queued to Prisma DB! Run `python scripts/wandb_sync.py` to push to W&B.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
