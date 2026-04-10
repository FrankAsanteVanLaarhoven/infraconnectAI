import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const runs = await db.skillRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const mapped = runs.map(r => ({
      id: r.id,
      skill: r.skill,
      status: r.status,
      input: r.input,
      output: r.output,
      memoryRead: JSON.parse(r.memoryRead),
      memoryWritten: JSON.parse(r.memoryWritten),
      duration: r.duration,
      error: r.error,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({ runs: mapped });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skill, input } = body;

    if (!skill) {
      return NextResponse.json({ error: 'skill required' }, { status: 400 });
    }

    const startTime = Date.now();

    // Create skill run record
    const run = await db.skillRun.create({
      data: {
        skill,
        status: 'running',
        input: input ?? '',
        memoryRead: '[]',
        memoryWritten: '[]',
      },
    });

    try {
      // Simulate skill execution with memory contract awareness
      const contractReads: Record<string, string[]> = {
        spec: ['canon/standards/*', 'wiki/projects/*'],
        plan: ['canon/standards/*', 'wiki/projects/*', 'wiki/entities/*'],
        build: ['scratch/*', 'wiki/entities/*'],
        test: ['wiki/projects/*', 'canon/standards/testing.md'],
        review: ['wiki/*', 'canon/*', 'governance/feedback/*'],
        ship: ['canon/standards/release.md'],
      };

      const contractWrites: Record<string, string[]> = {
        spec: ['wiki/projects/*', 'log.md'],
        plan: ['scratch/*-plan.md'],
        build: ['scratch/*-wip.md', 'raw/telemetry/build-logs/'],
        test: ['raw/telemetry/test-runs/', 'wiki/decisions/*'],
        review: ['wiki/decisions/*', 'canon/patterns/*'],
        ship: ['canon/standards/*'],
      };

      // Read relevant memory nodes
      const relevantNodes = await db.memoryNode.findMany({
        where: {
          OR: [
            { level: { in: ['L1', 'L2'] } },
            { status: { in: ['wiki', 'canon'] } },
          ],
        },
        take: 10,
      });

      const duration = Date.now() - startTime;

      // Update run as completed
      await db.skillRun.update({
        where: { id: run.id },
        data: {
          status: 'completed',
          output: `Executed /${skill}${input ? ` for "${input}"` : ''}. Processed ${relevantNodes.length} memory nodes.`,
          memoryRead: JSON.stringify(relevantNodes.map(n => n.id)),
          memoryWritten: JSON.stringify([]),
          duration,
        },
      });

      // Log activity
      await db.activityLog.create({
        data: {
          action: 'skill',
          target: run.id,
          detail: `Completed /${skill}${input ? ` → ${input}` : ''}`,
        },
      });

      return NextResponse.json({
        success: true,
        id: run.id,
        output: `Executed /${skill}${input ? ` for "${input}"` : ''}. Processed ${relevantNodes.length} memory nodes.`,
        duration,
        memoryRead: contractReads[skill] ?? [],
        memoryWritten: contractWrites[skill] ?? [],
      });
    } catch (skillError) {
      const duration = Date.now() - startTime;
      await db.skillRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          error: String(skillError),
          duration,
        },
      });
      return NextResponse.json({ success: false, error: String(skillError) }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
