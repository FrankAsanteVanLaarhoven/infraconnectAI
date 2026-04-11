import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    agents: [
      { id: 'ca-agent-1', type: 'CaP-X Agent', role: 'Mission Commander', runtimeStatus: 'active' },
      { id: 'ca-agent-2', type: 'CaP-X Agent', role: 'Safety Auditor', runtimeStatus: 'idle' }
    ]
  })
}
