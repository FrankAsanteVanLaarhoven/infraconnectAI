import { NextResponse } from "next/server";
import crypto from 'crypto';

// Simulated DB for Enterprise Uplinks
let uplinks = [
  { id: 'up-1', clientId: 'globex-intl', status: 'ACTIVE', lastHeartbeat: new Date().toISOString() }
];

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    uplinks
  });
}

export async function POST(req: Request) {
  try {
    const { action, clientId } = await req.json();

    if (action === 'GENERATE_KEY') {
      const apiKey = `ic_key_${crypto.randomBytes(16).toString('hex')}`;
      const newUplink = {
        id: `up-${crypto.randomUUID().slice(0, 8)}`,
        clientId: clientId || 'pending_client',
        status: 'PENDING_ACTIVATION',
        lastHeartbeat: new Date().toISOString()
      };
      uplinks.push(newUplink);
      
      return NextResponse.json({ 
        success: true, 
        apiKey,
        uplinkId: newUplink.id
      });
    }

    if (action === 'HEARTBEAT') {
      const { uplinkId } = await req.json();
      const uplink = uplinks.find(u => u.id === uplinkId);
      if (uplink) {
         uplink.lastHeartbeat = new Date().toISOString();
         uplink.status = 'ACTIVE';
         return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Uplink failure" }, { status: 500 });
  }
}
