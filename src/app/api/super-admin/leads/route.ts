import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const leads = await db.enterpriseLead.findMany({
      orderBy: { capturedAt: 'desc' },
      take: 100
    });

    return NextResponse.json({ success: true, count: leads.length, data: leads });
  } catch (error: any) {
    console.error("Super Admin Leads Fetch Error:", error);
    return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
  }
}
