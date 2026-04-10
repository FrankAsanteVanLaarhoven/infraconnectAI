import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const nodes = await db.memoryNode.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { children: true, feedbacks: true },
    });

    const mapped = nodes.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      level: n.level,
      plane: n.plane,
      category: n.category,
      status: n.status,
      parentId: n.parentId,
      tags: JSON.parse(n.tags),
      healthScore: n.healthScore,
      conflictCount: n.conflictCount,
      referenceCount: n.referenceCount,
      lastValidated: n.lastValidated?.toISOString() ?? null,
      expiresAt: n.expiresAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
      children: n.children.map(c => ({
        id: c.id,
        title: c.title,
        content: c.content,
        level: c.level,
        plane: c.plane,
        category: c.category,
        status: c.status,
        parentId: c.parentId,
        tags: JSON.parse(c.tags),
        healthScore: c.healthScore,
        conflictCount: c.conflictCount,
        referenceCount: c.referenceCount,
        lastValidated: c.lastValidated?.toISOString() ?? null,
        expiresAt: c.expiresAt?.toISOString() ?? null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      feedbacks: n.feedbacks.map(f => ({
        id: f.id,
        nodeId: f.nodeId,
        type: f.type,
        reason: f.reason,
        createdAt: f.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({ nodes: mapped });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, level, plane, category, status, parentId, tags } = body;

    const node = await db.memoryNode.create({
      data: {
        title: title ?? 'Untitled',
        content: content ?? '',
        level: level ?? 'L1',
        plane: plane ?? 'memory',
        category: category ?? '',
        status: status ?? 'scratch',
        parentId: parentId ?? null,
        tags: JSON.stringify(tags ?? []),
        healthScore: 1.0,
      },
    });

    return NextResponse.json({ success: true, id: node.id });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === 'search') {
      const { query, filter } = body;
      const allNodes = await db.memoryNode.findMany({
        orderBy: { updatedAt: 'desc' },
      });

      // Simple BM25-like scoring
      const terms = query.toLowerCase().split(/\s+/);
      const scored = allNodes
        .filter(n => filter === 'all' || n.level === filter)
        .map(node => {
          const text = `${node.title} ${node.content} ${node.category} ${node.tags}`.toLowerCase();
          let score = 0;
          terms.forEach(term => {
            const matches = text.split(term).length - 1;
            if (matches > 0) {
              score += matches * (1 + Math.log(1 + matches));
            }
          });
          // Level bonus
          if (node.level === 'L2') score *= 1.5;
          else if (node.level === 'L1') score *= 1.2;
          // Health bonus
          score *= 0.5 + node.healthScore * 0.5;
          return { node, score };
        })
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      const results = scored.map(s => ({
        id: s.node.id,
        title: s.node.title,
        content: s.node.content,
        level: s.node.level,
        plane: s.node.plane,
        category: s.node.category,
        status: s.node.status,
        tags: JSON.parse(s.node.tags),
        healthScore: s.node.healthScore,
        createdAt: s.node.createdAt.toISOString(),
        updatedAt: s.node.updatedAt.toISOString(),
      }));

      return NextResponse.json({ results });
    }

    // Update node
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.plane !== undefined) updateData.plane = data.plane;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
    if (data.healthScore !== undefined) updateData.healthScore = data.healthScore;
    if (data.lastValidated !== undefined) updateData.lastValidated = data.lastValidated ? new Date(data.lastValidated) : null;

    await db.memoryNode.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await db.memoryNode.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
