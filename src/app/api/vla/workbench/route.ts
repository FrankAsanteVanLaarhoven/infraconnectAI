import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * VLA Training Workbench API
 * GET  — List VLA training sessions
 * POST — Create a new VLA training session
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) where.status = status;

    const sessions = await db.vlaTrainingSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, sessions });
  } catch (e: any) {
    console.error('[API] VLA workbench GET error:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, baseModel, datasetMix, totalSteps } = body;

    if (!name || !baseModel || !totalSteps) {
      return NextResponse.json(
        { success: false, error: 'name, baseModel, and totalSteps are required' },
        { status: 400 }
      );
    }

    const session = await db.vlaTrainingSession.create({
      data: {
        name,
        baseModel,
        datasetMix: datasetMix || { real: [], synthetic: ['LIBERO'] },
        totalSteps,
        status: 'queued',
      },
    });

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (e: any) {
    console.error('[API] VLA workbench POST error:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
