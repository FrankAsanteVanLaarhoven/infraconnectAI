import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const leads = await db.lead.findMany();
    
    const totalPipelineValue = leads.reduce((acc, l) => acc + (l.projectedValue || l.score * 1200), 0);
    const weightedValue = leads.reduce((acc, l) => {
      const prob = l.score / 100;
      const val = l.projectedValue || l.score * 1200;
      return acc + (val * prob);
    }, 0);

    const stages = {
      prospection: leads.filter(l => l.status === 'new').length,
      qualification: leads.filter(l => l.status === 'qualified').length,
      negotiation: leads.filter(l => l.status === 'meeting').length,
      closed: leads.filter(l => l.status === 'closed').length
    };

    return NextResponse.json({
      totalPipelineValue,
      weightedValue,
      stages,
      leadCount: leads.length
    });
  } catch (error) {
    console.error("[API_REVENUE_PROJECTIONS_ERROR]", error);
    return NextResponse.json({ error: "Aggregation failed" }, { status: 500 });
  }
}
