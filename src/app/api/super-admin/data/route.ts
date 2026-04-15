import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * api/super-admin/data
 * Aggregated telemetry and fleet data for the Super Admin Mission Control.
 * restricted to 'superadmin' role.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // STRICT SECURITY GATE
    if (!session || (session.user as any)?.role !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED_ACCESS_BREACH_DETECTED' }, { status: 403 });
    }

    // 1. Fetch ALL Fleet Nodes (Infrastructure focus)
    const rawFleetNodes = await db.fleetNode.findMany({
      orderBy: { lastSeen: 'desc' }
    });

    // Handle BigInt serialization for Next.js JSON response
    const fleetNodes = rawFleetNodes.map(n => ({
      ...n,
      memoryBytes: n.memoryBytes ? Number(n.memoryBytes) : 0
    }));

    // 2. Fetch ALL Subscriptions
    const subscriptions = await db.intelSubscription.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // 3. Fetch Recent Security Incidents / Global Audit Logs
    const incidents = await db.securityIncident.findMany({
      take: 20,
      orderBy: { ts: 'desc' }
    });

    const auditLogs = await db.aiAuditLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' }
    });

    // 4. Fetch Active Anomalies
    const anomalies = await db.anomaly.findMany({
      where: { resolved: false },
      take: 20,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: {
        fleetNodes,
        subscriptions,
        incidents,
        auditLogs,
        anomalies
      }
    });

  } catch (error) {
    console.error('SUPER_ADMIN_DATA_ERROR:', error);
    return NextResponse.json({ success: false, error: 'INTERNAL_MISSION_FAILURE', details: (error as any).message }, { status: 500 });
  }
}
