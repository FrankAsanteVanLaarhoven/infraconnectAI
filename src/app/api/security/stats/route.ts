import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Sovereign Security Stats API
 * Provides real-time telemetry on devices and security incidents for Phase 18.
 */

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use the username as clientId
  const clientId = session.user?.name || "admin";

  try {
    const [incidents, devices, subscription] = await Promise.all([
      db.securityIncident.findMany({
        where: { clientId },
        orderBy: { ts: 'desc' },
        take: 15
      }),
      db.userDevice.findMany({
        where: { clientId },
        orderBy: { lastSeen: 'desc' }
      }),
      db.intelSubscription.findUnique({
        where: { clientId }
      })
    ]);

    return NextResponse.json({
      incidents,
      devices,
      subscription,
      stats: {
        blockedAttacks: incidents.length,
        activeDevices: devices.filter(d => d.isAuthorized).length,
        deviceLimit: subscription?.deviceLimit || 1
      }
    });
  } catch (error) {
    console.error("Security Stats Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
