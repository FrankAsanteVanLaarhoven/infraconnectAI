import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateLeadROI } from "@/lib/revenue/roiEngine";

export async function GET() {
  try {
    const leads = await db.lead.findMany({
      where: {
        score: { gte: 50 }, // Only analyze warm/hot leads
      }
    });

    const totalProjectedROI = leads.reduce((acc, lead) => {
      const metrics = calculateLeadROI(lead.score, lead.projectedValue, lead.companySize || undefined);
      return acc + metrics.totalAnnualImpact;
    }, 0);

    const highLeverageLeads = leads
      .map(lead => ({
        email: lead.email,
        score: lead.score,
        impact: calculateLeadROI(lead.score, lead.projectedValue, lead.companySize || undefined).totalAnnualImpact
      }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 3);

    return NextResponse.json({
      totalAnnualImpact: totalProjectedROI,
      highLeverageLeads,
      intelligenceSync: new Date().toISOString(),
      activeNegotiations: leads.filter(l => l.status === 'meeting').length
    });
  } catch (error) {
    console.error("[API_REVENUE_SUMMARY_ERROR]", error);
    return NextResponse.json({ error: "Intelligence sync failed" }, { status: 500 });
  }
}
