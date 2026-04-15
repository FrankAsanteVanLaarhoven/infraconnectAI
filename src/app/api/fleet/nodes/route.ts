import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function GET() {
  try {
    const nodes = await prisma.fleetNode.findMany({
      orderBy: { lastSeen: "desc" },
      include: {
        anomalies: {
          where: { resolved: false },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
    return NextResponse.json(nodes);
  } catch (error) {
    console.warn("Database connection unavailable in API. Returning mock nodes for Demo Mode.");
    const mockNodes = [
      {
        id: "mock1", robotId: "NEMO-A1", alias: "Fabrication Arm Alpha", status: "online", 
        lastSeen: new Date(), memoryBytes: 4096000, anomalyCount: 0, createdAt: new Date(), updatedAt: new Date(),
        anomalies: []
      },
      {
        id: "mock2", robotId: "NEMO-A2", alias: "Logistics Chassis Beta", status: "degraded", 
        lastSeen: new Date(), memoryBytes: 2148000, anomalyCount: 2, createdAt: new Date(), updatedAt: new Date(),
        anomalies: [{ id: "a1", type: "latency_spike", severity: "medium", message: "Kinematic solve delayed", detectedAt: new Date(), resolved: false, fleetNodeId: "mock2", metadata: null }]
      }
    ];
    // Return with a BigInt stringifier solution out-of-the-box handled by Next.js if object looks normal, 
    // but memoryBytes above is just a raw JS number right now to avoid JSON.stringify BigInt crash
    return NextResponse.json(mockNodes);
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const node = await prisma.fleetNode.upsert({
    where: { robotId: body.robotId },
    update: {
      status: body.status ?? "online",
      lastSeen: new Date(),
      memoryBytes: BigInt(body.memoryBytes ?? 0),
    },
    create: {
      robotId: body.robotId,
      alias: body.alias ?? body.robotId,
      status: body.status ?? "online",
      memoryBytes: BigInt(body.memoryBytes ?? 0),
    },
  });
  return NextResponse.json(node);
}
