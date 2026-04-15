import { NextResponse } from 'next/server';

export async function GET() {
  // In a real SOTA app, we'd query the DB for agents and their connection history
  const nodes = [
    { id: 'nexus-core', name: 'CONTROL PLANE', type: 'core', val: 20 },
    { id: 'gov-engine', name: 'GOVERNANCE STRATA', type: 'engine', val: 15 },
    { id: 'agent-01', name: 'RECON-ALPHA', type: 'agent', val: 10 },
    { id: 'agent-02', name: 'PROWLER-02', type: 'agent', val: 10 },
    { id: 'agent-03', name: 'GUARDIAN-MAIN', type: 'agent', val: 10 },
  ];

  const links = [
    { source: 'nexus-core', target: 'gov-engine', type: 'command' },
    { source: 'nexus-core', target: 'agent-01', type: 'websocket' },
    { source: 'nexus-core', target: 'agent-02', type: 'websocket' },
    { source: 'nexus-core', target: 'agent-03', type: 'websocket' },
    { source: 'gov-engine', target: 'agent-01', type: 'sync' },
    { source: 'gov-engine', target: 'agent-02', type: 'sync' },
    { source: 'gov-engine', target: 'agent-03', type: 'sync' },
  ];

  return NextResponse.json({ success: true, nodes, links });
}
