// src/app/api/constraints/route.ts
import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function GET() {
  const constraints = await prisma.safetyConstraint.findMany({
    orderBy: [{ severity: 'asc' }, { domain: 'asc' }],
    include: { _count: { select: { violations: true } } },
  })
  return NextResponse.json({ constraints })
}

export async function POST(req: Request) {
  const data = await req.json()
  const constraint = await prisma.safetyConstraint.create({ data })
  await prisma.activityLog.create({
    data: {
      action: 'constraint',
      target: constraint.id,
      detail: `Created safety constraint: ${constraint.name}`,
    },
  })
  return NextResponse.json(constraint, { status: 201 })
}

export async function PUT(req: Request) {
  const { id, ...data } = await req.json()
  const updated = await prisma.safetyConstraint.update({ where: { id }, data })

  // If violation count exceeds threshold, flag for review and demote linked memory node
  if (updated.violationCount > 5 && updated.status === 'active') {
    await prisma.safetyConstraint.update({
      where: { id },
      data: { status: 'under_review' },
    })
    if (updated.memoryNodeId) {
      await prisma.memoryNode.update({
        where: { id: updated.memoryNodeId },
        data: { healthScore: 0.3, conflictCount: { increment: 1 } },
      })
    }
    await prisma.activityLog.create({
      data: {
        action: 'constraint',
        target: id,
        detail: `Constraint "${updated.name}" auto-flagged for review (${updated.violationCount} violations)`,
        metadata: JSON.stringify({ violationCount: updated.violationCount }),
      },
    })
  }
  return NextResponse.json(updated)
}
