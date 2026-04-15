import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    profiles: [
      { 
        id: 'p1', 
        slug: 'alpha-prime', 
        displayName: 'Alpha Prime', 
        description: 'Mission Control Orchestrator', 
        voiceTone: 'formal', 
        responseFormat: 'markdown', 
        contextDepth: 10, 
        active: true,
        _count: { interactions: 154 }
      },
      { 
        id: 'p2', 
        slug: 'safety-sentinel', 
        displayName: 'Safety Sentinel', 
        description: 'Constraint Validation Specialist', 
        voiceTone: 'terse', 
        responseFormat: 'bullet', 
        contextDepth: 5, 
        active: false,
        _count: { interactions: 88 }
      }
    ], 
    active: {
      personaId: 'p1',
      slug: 'alpha-prime',
      displayName: 'Alpha Prime',
      voiceTone: 'formal',
      responseFormat: 'markdown',
      contextDepth: 10,
      memoryAccess: ['L0', 'L1', 'L2'],
      toolPermissions: ['READ', 'EXECUTE'],
      systemPromptExt: 'Priority: Stabilization'
    }
  })
}

export async function POST() {
  return NextResponse.json({ success: true })
}
