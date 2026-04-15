// src/app/api/governance/cycle/route.ts
import { NextResponse } from 'next/server'

/**
 * @deprecated Use /api/governance with { action: 'cycle' } instead
 */
export async function POST(req: Request) {
  const url = new URL(req.url)
  const base = `${url.protocol}//${url.host}`
  
  const res = await fetch(`${base}/api/governance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'cycle' })
  })
  
  return NextResponse.json(await res.json())
}
