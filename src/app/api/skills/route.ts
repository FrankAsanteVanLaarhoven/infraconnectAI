import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const runs = await db.skillRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50,
    });

    const mapped = runs.map(r => ({
      id: r.id,
      skill: r.skill,
      status: r.status,
      input: r.title,
      output: r.resultSummary,
      duration: r.durationMs,
      error: r.errorMessage,
      createdAt: r.startedAt.toISOString(),
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

    const run = await db.skillRun.create({
      data: {
        shortId: Math.random().toString(36).substr(2, 9),
        skill: skill as any,
        status: 'passed',
        actorId: 'system',
        startedAt: new Date(),
        title: typeof input === 'string' ? input : JSON.stringify(input),
        resultSummary: `Executed /${skill}. Processed automatically by mock edge execution.`,
        durationMs: 450,
        metrics: {}
      },
    });

    return NextResponse.json({
      success: true,
      id: run.id,
      output: run.resultSummary,
      duration: run.durationMs,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
