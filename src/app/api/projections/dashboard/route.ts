import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dashboard = await db.dashboardProjection.findUnique({
      where: { id: "singleton" }
    });
    return NextResponse.json(dashboard);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
