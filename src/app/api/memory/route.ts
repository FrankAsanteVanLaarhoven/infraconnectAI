// src/app/api/memory/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const level    = searchParams.get('stratum') as any  // L0 | L1 | L2
  const state    = searchParams.get('status') as any
  const q        = searchParams.get('q')
  const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(50, parseInt(searchParams.get('pageSize') ?? String(PAGE_SIZE)))

  const where = {
    ...(level ? { level } : {}),
    ...(state ? { state } : {}),
    ...(q ? {
      OR: [
        { title:   { contains: q, mode: 'insensitive' as const } },
        { summary: { contains: q, mode: 'insensitive' as const } },
        { tags:    { contains: q, mode: 'insensitive' as const } },
      ],
    } : {}),
  }

  try {
    const [nodes, total, levelsRaw, unresolvedConflicts] = await Promise.all([
      prisma.memoryNode.findMany({
        where,
        select: {
          id: true,
          shortId: true,
          slug: true,
          title: true,
          summary: true,
          kind: true,
          level: true,
          state: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { conflictsAsSource: true, conflictsAsTarget: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.memoryNode.count({ where }),
      prisma.memoryNode.groupBy({ by: ['level'], _count: true }),
      prisma.conflict.count({ where: { status: 'open' } }),
    ])

    const projected = nodes.map(n => ({
      ...n,
      stratum: n.level,
      status: n.state,
      type: n.kind,
      content: n.summary ?? '',
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
      promotedAt: null,
      expiresAt: null,
    }))

    const strata = { L0: 0, L1: 0, L2: 0 }
    for (const s of levelsRaw) {
      if (s.level === 'L0' || s.level === 'L1' || s.level === 'L2') {
        strata[s.level] = s._count
      }
    }

    return NextResponse.json({
      nodes: projected,
      total,
      page,
      pageSize,
      strata,
      unresolvedConflicts,
    })
  } catch (e) {
    return NextResponse.json({
      nodes: [],
      total: 0,
      page: 1,
      pageSize: 20,
      strata: { L0: 0, L1: 0, L2: 0 },
      unresolvedConflicts: 0
    })
  }
}

export async function POST(req: NextRequest) {
  const { title, content, type, tags } = await req.json()
  if (!title || !content) {
    return NextResponse.json({ error: 'title and content required' }, { status: 400 })
  }

  const shortId = Math.random().toString(36).substring(2, 8)
  const node = await prisma.memoryNode.create({
    data: {
      shortId,
      slug: shortId,
      title,
      summary: content,
      kind: type ?? 'artifact',
      tags: Array.isArray(tags) ? tags.join(',') : (tags ?? null),
      level: 'L0',
      plane: 'memory',
      state: 'draft',
      createdBy: 'system',
    },
  })

  return NextResponse.json({ node: { ...node, content: node.summary } }, { status: 201 })
}
