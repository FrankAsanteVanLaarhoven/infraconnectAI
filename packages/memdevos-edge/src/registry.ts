export interface LocalSkill {
  id: string
  name: string
  description: string
  constraints: string[]
}

export class SkillRegistry {
  private skills: Map<string, LocalSkill> = new Map()

  /**
   * Syncs the local registry with a remote manifest.
   */
  sync(manifest: Record<string, LocalSkill>) {
    console.log(`[SkillRegistry] Synchronizing ${Object.keys(manifest).length} capabilities...`)
    this.skills.clear()
    Object.entries(manifest).forEach(([id, skill]) => {
      this.skills.set(id, skill)
    })
  }

  getSkill(skillId: string): LocalSkill | undefined {
    return this.skills.get(skillId)
  }

  isCapable(skillId: string): boolean {
    return this.skills.has(skillId)
  }

  getAvailableSkills(): string[] {
    return Array.from(this.skills.keys())
  }
}

export const skillRegistry = new SkillRegistry()
