import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      // Mock leads for production preview without DB
      const mockLeads = [
        { id: "lead_1", score: 85, industry: "MARITIME", status: "HOT", email: "client_a@example.com", capturedAt: new Date() },
        { id: "lead_2", score: 92, industry: "ENERGY", status: "WARM", email: "client_b@example.com", capturedAt: new Date() }
      ];
      return NextResponse.json({ success: true, count: mockLeads.length, data: mockLeads });
    }

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
