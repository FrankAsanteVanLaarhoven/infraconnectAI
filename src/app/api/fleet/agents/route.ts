import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    agents: [
      {
        id: 'agent-01',
        slug: 'recon-alpha',
        displayName: 'RECON-ALPHA',
        agentType: 'SAT_INTEL',
        deployTier: 'edge',
        status: 'live',
        lastHeartbeat: new Date().toISOString(),
        capabilities: ['SAR', 'OSINT'],
        modalitySet: ['rgb', 'thermal'],
        simPaired: 'sim-01',
        lat: 51.5074, // London
        lng: -0.1278,
        _count: { incidents: 0, telemetry: 1240 }
      },
      {
        id: 'agent-02',
        slug: 'prowler-02',
        displayName: 'PROWLER-02',
        agentType: 'UAV_TACTICAL',
        deployTier: 'sim',
        status: 'sim',
        lastHeartbeat: new Date().toISOString(),
        capabilities: ['VISUAL', 'SIGINT'],
        modalitySet: ['rgb', 'lidar', 'audio'],
        simPaired: null,
        lat: 35.6762, // Tokyo
        lng: 139.6503,
        _count: { incidents: 1, telemetry: 850 }
      },
      {
        id: 'agent-03',
        slug: 'guardian-main',
        displayName: 'GUARDIAN-MAIN',
        agentType: 'SENTRY_FIXED',
        deployTier: 'edge',
        status: 'live',
        lastHeartbeat: new Date().toISOString(),
        capabilities: ['THERMAL', 'SAFETY'],
        modalitySet: ['rgb', 'thermal'],
        simPaired: null,
        lat: 37.7749, // San Francisco
        lng: -122.4194,
        _count: { incidents: 0, telemetry: 2100 }
      }
    ]
  });
}
