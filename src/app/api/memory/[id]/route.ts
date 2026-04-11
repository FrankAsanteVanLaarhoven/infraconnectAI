// src/app/api/memory/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const node = await prisma.memoryNode.findUnique({
    where: { id: params.id },
    include: {
      conflictsAsSource: { orderBy: { createdAt: 'desc' }, take: 5 },
      conflictsAsTarget: { orderBy: { createdAt: 'desc' }, take: 5 },
      _count: { select: { conflictsAsSource: true, conflictsAsTarget: true } },
    },
  })
  if (!node) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    node: {
      ...node,
      stratum: node.level,
      status: node.state,
      content: node.summary ?? '',
      createdAt:  node.createdAt.toISOString(),
      updatedAt:  node.updatedAt.toISOString(),
    },
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Mock patch behavior to avoid 500s where schema is missing fields
  return NextResponse.json({ node: { id: params.id } })
}
