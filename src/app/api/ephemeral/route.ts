import { NextResponse } from "next/server";

// In-memory Mission Buffer (Simulated)
let missionBuffer: any[] = [
  {
    id: "alert-1",
    title: "Brent Crude Surge: Day 5",
    description: "Energy leads now 2.4x more likely to convert. Swarm persona shift recommended.",
    type: "URGENT",
    sector: "Energy",
    magnitudeDelta: 0.15,
    timestamp: new Date().toISOString()
  },
  {
    id: "alert-2",
    title: "US East Grid Vulnerability Detect",
    description: "Infrastructure leads in Maine/Vermont flagging resilience gaps. Priority: Active.",
    type: "INFO",
    sector: "Energy",
    magnitudeDelta: 0.08,
    timestamp: new Date().toISOString()
  }
];

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    alerts: missionBuffer,
    bufferSize: missionBuffer.length
  });
}

export async function POST(req: Request) {
  try {
    const { command } = await req.json();

    if (command === 'PURGE') {
      console.log("[EPHEMERAL_API] Executing Mission Purge...");
      missionBuffer = [];
      return NextResponse.json({ success: true, message: "Mission buffer wiped." });
    }

    return NextResponse.json({ error: "Unsupported command" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Command failed" }, { status: 500 });
  }
}
