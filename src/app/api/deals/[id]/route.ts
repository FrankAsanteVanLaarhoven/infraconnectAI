import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateLeadROI } from "@/lib/revenue/roiEngine";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const lead = await db.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // Protection: Only show for leads that have been "qualified" 
    // or specifically prepared by the founder.
    if (lead.score < 50 && lead.status === 'new') {
        return NextResponse.json({ error: "Proposal verification in progress" }, { status: 403 });
    }

    const roi = calculateLeadROI(lead.score, lead.projectedValue, lead.companySize || undefined);

    return NextResponse.json({
        id: lead.id,
        company: lead.company || lead.email.split('@')[0],
        roi,
        strategicBrief: lead.strategicBrief,
        status: lead.status,
        updatedAt: lead.updatedAt
    });
  } catch (error) {
    console.error("[API_DEAL_PORTAL_ERROR]", error);
    return NextResponse.json({ error: "Internal failure" }, { status: 500 });
  }
}
