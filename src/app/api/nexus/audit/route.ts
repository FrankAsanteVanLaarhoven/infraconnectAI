import { NextResponse } from "next/server";
import { queryAuditVault, AuditCategory } from "@/lib/nexus/auditVault";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as AuditCategory | null;
    const limit = parseInt(searchParams.get('limit') || '50');

    const events = await queryAuditVault({
      ...(category && { category }),
      limit
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      events
    });
  } catch (error) {
    console.error("[API_AUDIT_ERROR]", error);
    return NextResponse.json({ events: [] });
  }
}
