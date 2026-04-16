import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET Detail by Email
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

// POST Update Strategic Data
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, notes, projectedValue, status } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const lead = await db.lead.update({
      where: { email },
      data: {
        notes,
        projectedValue: projectedValue ? parseFloat(projectedValue) : undefined,
        status: status || undefined,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("[API_CRM_LEAD_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
