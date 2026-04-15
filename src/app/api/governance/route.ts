// src/app/api/governance/route.ts
import { NextResponse } from 'next/server'
import { GovernanceEngine } from '@/lib/governance/engine'
import { db as prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body
    const engine = new GovernanceEngine()

    switch (action) {
      case 'run_cycle':
      case 'cycle': {
        const result = await engine.runPolicyCycle(true) // Enable Autonomous Mode
        return NextResponse.json({ ok: true, ...result })
      }

      case 'promote': {
        const { nodeId, toStatus, toLevel } = body
        if (!nodeId) return NextResponse.json({ ok: false, error: 'nodeId is required' }, { status: 400 })
        
        const node = await prisma.memoryNode.update({
          where: { id: nodeId },
          data: {
            state: toStatus === 'wiki' ? 'active' : 'canonical' as any,
            level: toLevel.toUpperCase() as any,
            lastReviewedAt: new Date()
          }
        })
        return NextResponse.json({ ok: true, title: node.title })
      }

      default:
        return NextResponse.json({ ok: false, error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (e) {
    console.error('[GOVERNANCE_API_ERROR]', e)
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Operation failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return current health summary and candidates for convenience
  try {
    const engine = new GovernanceEngine()
    const result = await engine.runPolicyCycle()
    return NextResponse.json({
      nodes: result.scored,
      promotionCandidates: result.promotionCandidates,
      decayCandidates: result.decayCandidates,
      healthSummary: result.healthSummary
    })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
