import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const health = await db.healthProjection.findUnique({
      where: { id: "singleton" }
    });
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
