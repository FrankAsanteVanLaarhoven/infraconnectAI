// src/app/api/constraints/route.ts
import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function GET() {
  const constraints = await prisma.safetyDirective.findMany({
    orderBy: [{ severity: 'asc' }, { domain: 'asc' }],
    include: { _count: { select: { violations: true } } },
  })
  // Log to verify
  console.log("[DEBUG] constraints count:", constraints.length, "fields:", Object.keys(constraints[0] || {}));

  return NextResponse.json({ constraints })
}

export async function POST(req: Request) {
  const data = await req.json()
  const constraint = await prisma.safetyDirective.create({ 
    data: {
      name: data.name,
      severity: data.severity,
      domain: data.domain
    }
  })
  
  await prisma.aiAuditLog.create({
    data: {
      user: 'system',
      action: 'constraint',
      resource: constraint.id,
      input: `Created safety directive: ${constraint.name}`,
    },
  })
  return NextResponse.json(constraint, { status: 201 })
}

export async function PUT(req: Request) {
  const { id, ...data } = await req.json()
  const updated = await prisma.safetyDirective.update({ 
    where: { id }, 
    data: {
      name: data.name,
      severity: data.severity,
      domain: data.domain
    } 
  })

  return NextResponse.json(updated)
}

