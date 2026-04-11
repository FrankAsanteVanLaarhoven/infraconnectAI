// prisma/seed-vla.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function seedVLA() {
  // Safety constraints
  const constraints = [
    {
      name: 'hospital_corridor_max_vel',
      displayName: 'Max corridor velocity',
      formalSpec: 'G(velocity < 0.8)',
      domain: 'navigation',
      severity: 'hard',
      threshold: 0.8,
      unit: 'm/s',
      status: 'active',
    },
    {
      name: 'patient_proximity_min_dist',
      displayName: 'Min patient proximity distance',
      formalSpec: 'G(dist_to_patient > 1.5)',
      domain: 'navigation',
      severity: 'hard',
      threshold: 1.5,
      unit: 'm',
      status: 'active',
    },
    {
      name: 'deadline_nav_max_ms',
      displayName: 'Navigation deadline compliance',
      formalSpec: 'G(nav_deadline_ms < 200)',
      domain: 'system',
      severity: 'soft',
      threshold: 200,
      unit: 'ms',
      status: 'active',
    },
    {
      name: 'manipulation_force_limit',
      displayName: 'Max manipulation force',
      formalSpec: 'G(end_effector_force < 10)',
      domain: 'manipulation',
      severity: 'hard',
      threshold: 10.0,
      unit: 'N',
      status: 'active',
    },
    {
      name: 'obstacle_clearance_min',
      displayName: 'Min obstacle clearance',
      formalSpec: 'G(obstacle_dist > 0.3)',
      domain: 'navigation',
      severity: 'hard',
      threshold: 0.3,
      unit: 'm',
      status: 'active',
    },
  ]

  for (const c of constraints) {
    await prisma.safetyConstraint.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    })
  }

  // Seed an example completed sim run
  const run = await prisma.experimentRun.upsert({
    where: { runId: 'isaac-sim-run-001' },
    update: {},
    create: {
      runId: 'isaac-sim-run-001',
      environment: 'sim',
      description: 'Baseline hospital corridor navigation test',
      robot: 'fastbot',
      scenario: 'hospital_corridor_nav',
      durationSeconds: 120,
      successRate: 0.87,
      avgDeadlineMs: 165,
      deadlineSatisfied: true,
      constraintsSatisfied: false,
      totalViolations: 2,
      metrics: JSON.stringify({
        success_rate: 0.87,
        avg_deadline_ms: 165,
        max_velocity: 0.76,
        min_obstacle_dist: 0.38,
        collision_count: 0,
      }),
      status: 'completed',
      completedAt: new Date(),
    },
  })

  // Seed sim-to-real deltas
  const deltas = [
    { metric: 'obstacle_avoidance_rate', simValue: 0.95, realValue: 0.87, delta: 0.08, acceptable: true },
    { metric: 'nav_success_rate', simValue: 0.92, realValue: 0.87, delta: 0.05, acceptable: true },
    { metric: 'avg_deadline_ms', simValue: 145, realValue: 165, delta: 20, acceptable: true },
  ]
  for (const d of deltas) {
    // Basic deduplication for rerunning seed script safely
    const existing = await prisma.simToRealDelta.findFirst({
        where: { runId: run.id, metric: d.metric }
    })
    if (!existing) {
        await prisma.simToRealDelta.create({ data: { runId: run.id, ...d } })
    }
  }

  console.log('VLA seed data inserted.')
}

seedVLA()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
