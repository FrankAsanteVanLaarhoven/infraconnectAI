import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return NextResponse.json({
    sessions: [
      { id: 'sess-1', agentId: 'ca-agent-1', personaId: 'p-1', status: 'running', startedAt: new Date().toISOString() }
    ]
  })
}
