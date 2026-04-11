import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ activeSession: null, availableRoles: ['Mission_Commander', 'Safety_Auditor'] })
}

export async function POST() {
  return NextResponse.json({ success: true })
}
