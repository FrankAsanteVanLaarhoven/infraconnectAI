import { SKILL_CONTRACTS } from '@/lib/memory/types'

export interface SkillManifestEntry {
  id: string
  name: string
  tier: 'control' | 'edge'
  reads: string[]
  writes: string[]
  constraints: string[]
  description: string
}

export class ManifestBuilder {
  /**
   * Generates a manifest of skills designated for Edge execution.
   */
  static buildEdgeManifest(): Record<string, SkillManifestEntry> {
    const manifest: Record<string, SkillManifestEntry> = {}

    Object.values(SKILL_CONTRACTS).forEach((contract) => {
      if (contract.tier === 'edge') {
        manifest[contract.skill] = {
          id: contract.id,
          name: contract.skill,
          tier: 'edge',
          reads: contract.reads,
          writes: contract.writes,
          constraints: contract.constraints,
          description: contract.description
        }
      }
    })

    return manifest
  }
}
