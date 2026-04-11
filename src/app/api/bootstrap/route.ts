// src/app/api/bootstrap/route.ts
import { NextResponse } from 'next/server'
import { bootstrapSessionContext } from '@/lib/session/bootstrap'
import type { SkillName } from '@/lib/memory/types'

export async function POST(req: Request) {
  try {
    const { intent, skill } = await req.json()
    if (!intent) return NextResponse.json({ error: 'intent required' }, { status: 400 })

    const context = await bootstrapSessionContext(intent, skill as SkillName | undefined)
    return NextResponse.json(context)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Bootstrap failed' },
      { status: 500 }
    )
  }
}
