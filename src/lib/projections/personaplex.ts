// src/lib/projections/personaplex.ts

export interface PersonaProfileProjection {
  id: string
  slug: string
  displayName: string
  description: string | null
  voiceTone: 'formal' | 'casual' | 'terse' | 'verbose' | 'neutral'
  responseFormat: 'markdown' | 'json' | 'prose' | 'bullet'
  contextDepth: number
  memoryAccess: string[]
  toolPermissions: string[]
  active: boolean
  _count: { interactions: number }
}

export interface PersonaListProjection {
  profiles: PersonaProfileProjection[]
  active: {
    personaId: string
    slug: string
    displayName: string
    voiceTone: string
    responseFormat: string
    contextDepth: number
    memoryAccess: string[]
    toolPermissions: string[]
    systemPromptExt: string | null
  } | null
}
