// src/app/api/governance/cycle/route.ts
import { NextResponse } from 'next/server'
import { GovernanceEngine } from '@/lib/governance/engine'

export async function POST() {
  try {
    const engine = new GovernanceEngine()
    const result = await engine.runPolicyCycle()
    return NextResponse.json({ ok: true, result })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Cycle failed' },
      { status: 500 }
    )
  }
}
