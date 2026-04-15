import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    // In production, user auth extraction would happen here
    const userId = "user-id-demo";

    // Simulate exporting user telemetry, configurations, and AI audit history
    const auditLogs = await db.aiAuditLog.findMany({
      where: { user: userId },
      orderBy: { timestamp: 'desc' }
    });

    const exportData = {
      userData: {
        id: userId,
        status: "active",
        complianceMode: "metadata_only"
      },
      aiAuditLogs: auditLogs,
      connectedAgents: [], // Mock array representing connected environments
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      status: "success",
      message: "Data export compiled per GDPR Right to Access guidelines.",
      payload: exportData
    });
  } catch (error) {
    console.error("[GDPR Export] Error processing export:", error);
    return NextResponse.json({ error: "Failed to process export" }, { status: 500 });
  }
}
