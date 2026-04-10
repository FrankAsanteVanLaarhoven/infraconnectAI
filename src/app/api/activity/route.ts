import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const logs = await db.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const mapped = logs.map(l => ({
      id: l.id,
      action: l.action,
      target: l.target,
      detail: l.detail,
      metadata: JSON.parse(l.metadata),
      createdAt: l.createdAt.toISOString(),
    }));

    return NextResponse.json({ logs: mapped });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, target, detail, metadata } = body;

    const log = await db.activityLog.create({
      data: {
        action: action ?? 'unknown',
        target: target ?? '',
        detail: detail ?? '',
        metadata: JSON.stringify(metadata ?? {}),
      },
    });

    return NextResponse.json({ success: true, id: log.id });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
