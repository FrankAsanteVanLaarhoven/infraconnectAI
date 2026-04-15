import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const layouts = await db.ephemeralLayout.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return NextResponse.json({ success: true, layouts });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch layouts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, intent, config } = body;

    const layout = await db.ephemeralLayout.create({
      data: {
        title: title || 'Generated Intelligence',
        intent,
        config: config as any
      }
    });

    return NextResponse.json({ success: true, layout });
  } catch (error) {
    console.error('PERSIST_ERR:', error);
    return NextResponse.json({ success: false, error: 'Persistence failure' }, { status: 500 });
  }
}
