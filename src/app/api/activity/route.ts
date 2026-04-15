import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const logs = await db.aiAuditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    const mapped = logs.map(l => ({
      id: l.id,
      action: l.action,
      target: l.resource,
      detail: l.input,
      metadata: l.reasoning,
      createdAt: l.timestamp.toISOString(),
    }));

    return NextResponse.json({ logs: mapped });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, target, detail, metadata, user } = body;

    const log = await db.aiAuditLog.create({
      data: {
        user: user ?? 'system',
        action: action ?? 'unknown',
        resource: target ?? '',
        input: detail ?? '',
        reasoning: metadata ?? {},
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true, id: log.id });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

