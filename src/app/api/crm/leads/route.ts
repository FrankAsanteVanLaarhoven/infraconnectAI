import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const leads = await db.lead.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("[API_CRM_LEADS_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
