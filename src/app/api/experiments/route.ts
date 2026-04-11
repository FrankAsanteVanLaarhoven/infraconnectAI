// src/app/api/experiments/route.ts
import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const env = searchParams.get('env')   // sim | real | hybrid
  const take = Number(searchParams.get('take') ?? 20)

  const experiments = await prisma.experimentRun.findMany({
    where: env ? { environment: env } : {},
    orderBy: { createdAt: 'desc' },
    take,
    include: {
      violations: { include: { constraint: { select: { name: true, severity: true } } } },
      simRealDeltas: true,
    },
  })
  return NextResponse.json({ experiments })
}

export async function POST(req: Request) {
  const data = await req.json()
  const run = await prisma.experimentRun.create({ data })
  await prisma.activityLog.create({
    data: {
      action: 'create',
      target: run.id,
      detail: `Experiment run created: ${run.runId} (${run.environment})`,
    },
  })
  return NextResponse.json(run, { status: 201 })
}

export async function PUT(req: Request) {
  const { id, violations, simRealDeltas, ...data } = await req.json()

  const run = await prisma.experimentRun.update({ where: { id }, data })

  // Record violations
  if (violations?.length > 0) {
    for (const v of violations) {
      await prisma.experimentViolation.create({ data: { runId: id, ...v } })
      await prisma.safetyConstraint.update({
        where: { id: v.constraintId },
        data: { violationCount: { increment: 1 }, lastViolatedAt: new Date() },
      })
    }
  }

  // Record sim-to-real deltas
  if (simRealDeltas?.length > 0) {
    for (const d of simRealDeltas) {
      await prisma.simToRealDelta.create({ data: { runId: id, ...d } })
    }
  }

  return NextResponse.json(run)
}
