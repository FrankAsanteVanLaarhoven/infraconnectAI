import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nodeId = searchParams.get("nodeId");
  const severity = searchParams.get("severity");
  const resolved = searchParams.get("resolved");

  try {
    const anomalies = await prisma.anomaly.findMany({
      where: {
        ...(nodeId && { nodeId }),
        ...(severity && { severity }),
        ...(resolved !== null && { resolved: resolved === "true" }),
      },
      include: { node: { select: { alias: true, robotId: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(anomalies);
  } catch (error) {
    console.warn("Database connection unavailable in API. Returning mock anomalies for Demo Mode.");
    const mockAnomalies = [
      {
        id: "a1",
        nodeId: "mock2",
        type: "latency_spike",
        severity: "critical",
        description: "Kinematic solve delayed",
        createdAt: new Date(),
        detectedAt: new Date(),
        resolved: false,
        node: { alias: "Logistics Chassis Beta", robotId: "NEMO-A2" }
      },
      {
        id: "a2",
        nodeId: "mock1",
        type: "thermal_warning",
        severity: "warning",
        description: "Joint 4 temperature above optimal threshold",
        createdAt: new Date(Date.now() - 3600000),
        detectedAt: new Date(Date.now() - 3600000),
        resolved: false,
        node: { alias: "Fabrication Arm Alpha", robotId: "NEMO-A1" }
      }
    ];
    return NextResponse.json(mockAnomalies);
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const anomaly = await prisma.anomaly.create({
    data: {
      nodeId: body.nodeId,
      severity: body.severity,
      type: body.type,
      description: body.description,
      payload: body.payload ?? {},
    },
  });
  // increment counter on node
  await prisma.fleetNode.update({
    where: { id: body.nodeId },
    data: { anomalyCount: { increment: 1 } },
  });
  return NextResponse.json(anomaly, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const updated = await prisma.anomaly.update({
    where: { id: body.id },
    data: { resolved: true, resolvedAt: new Date() },
  });
  return NextResponse.json(updated);
}
