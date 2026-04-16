import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const lead = await db.lead.findUnique({
      where: { email }
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("[API_CRM_LEAD_DETAIL_ERROR]", error);
    return NextResponse.json({ error: "Internal failure" }, { status: 500 });
  }
}
