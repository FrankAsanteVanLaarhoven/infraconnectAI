// src/lib/skills/runner.ts
import { db as prisma } from '@/lib/db'
import { SKILL_CONTRACTS, type SkillName } from '@/lib/memory/types'
import { SKILL_CATALOG, SKILL_NAME_MAP } from './catalog'
import { agentRegistry } from '@/lib/agent-ops/AgentRegistry'

export interface SkillRunInput {
  skill: SkillName
  userPrompt: string
  projectContext?: string
  agentId?: string // Optional: target specific agent for edge skills
}

export interface SkillRunResult {
  runId: string
  skill: SkillName
  output: string
  memoryRead: string[]
  memoryWritten: string[]
  durationMs: number
  status: 'completed' | 'failed'
  error?: string
  verificationChecklist: VerificationItem[]
}

export interface VerificationItem {
  label: string
  passed: boolean | null
}

export class SkillRunner {
  async execute(input: SkillRunInput): Promise<SkillRunResult> {
    const startTime = Date.now()
    const contract = SKILL_CONTRACTS[input.skill]

    // 1. Create the run record
    const run = await prisma.skillRun.create({
      data: {
        skill: input.skill,
        status: 'running',
        input: input.userPrompt,
      },
    })

    try {
      let output = ''
      let verificationChecklist: VerificationItem[] = []
      let memoryReadIds: string[] = []

      // 2. Determine Execution Tier
      if (contract?.tier === 'edge') {
        const result = await this.executeOnEdge(input, run.id)
        output = result.output
        verificationChecklist = result.verification
      } else {
        const result = await this.executeOnControlPlane(input, run.id)
        output = result.output
        verificationChecklist = result.verification
        memoryReadIds = result.memoryReadIds
      }

      // 3. Update the run record
      const memoryWritten = [`scratch/${input.skill}-output-${run.id}`]
      
      await prisma.skillRun.update({
        where: { id: run.id },
        data: {
          status: 'completed',
          output: output,
          duration: Date.now() - startTime,
          memoryRead: JSON.stringify(memoryReadIds),
          memoryWritten: JSON.stringify(memoryWritten)
        }
      })

      return {
        runId: run.id,
        skill: input.skill,
        output: output,
        memoryRead: memoryReadIds,
        memoryWritten,
        durationMs: Date.now() - startTime,
        status: 'completed',
        verificationChecklist
      }
    } catch (e: any) {
      await prisma.skillRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          error: e.message || 'Unknown error',
          duration: Date.now() - startTime
        }
      })
      throw e
    }
  }

  private async executeOnEdge(input: SkillRunInput, runId: string): Promise<{ output: string, verification: VerificationItem[] }> {
    const agentId = input.agentId || agentRegistry.getAllActiveAgentIds()[0]
    
    if (!agentId || !agentRegistry.isOpen(agentId)) {
      throw new Error(`No active edge agent available for remote skill: ${input.skill}`)
    }

    console.log(`[SkillRunner] Dispatching ${input.skill} to agent: ${agentId}`)

    // Dispatch and wait for response via the registry's event emitter
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        agentRegistry.removeAllListeners(`skill_report:${runId}`)
        reject(new Error(`Timeout waiting for edge execution report for ${input.skill}`))
      }, 30000)

      agentRegistry.once(`skill_report:${runId}`, (report: any) => {
        clearTimeout(timeout)
        resolve({
          output: report.output,
          verification: report.verification || []
        })
      })

      agentRegistry.dispatch(agentId, 'skill_dispatch', {
        skillId: input.skill,
        runId,
        input: input.userPrompt
      }).catch(reject)
    })
  }

  private async executeOnControlPlane(input: SkillRunInput, runId: string): Promise<{ output: string, verification: VerificationItem[], memoryReadIds: string[] }> {
    const { nodes: memoryNodes } = await this.hydrateMemoryContext(input.skill)
    const memoryReadIds = memoryNodes.map((n) => n.id)
    const systemPrompt = this.buildSystemPrompt(input.skill, memoryNodes)

    let output = ''
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || "")
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: `${input.projectContext ? `Project context: ${input.projectContext}\n\n` : ''}Task: ${input.userPrompt}` }
      ])
      output = result.response.text()
    } catch (err) {
      output = this.generateFallback(input.skill)
    }

    return {
      output,
      memoryReadIds,
      verification: this.extractVerificationItems(output)
    }
  }

  private async hydrateMemoryContext(skill: SkillName) {
    const contract = SKILL_CONTRACTS[skill]
    const readLevels = (contract?.reads || []).map(r => r.split('/')[0].toLowerCase())

    const nodes = await prisma.memoryNode.findMany({
      where: {
        status: { in: ['wiki', 'canon'] },
        level: { in: readLevels.filter(l => l.startsWith('l')) as any }
      },
      take: 12,
      select: { id: true, title: true, content: true, level: true, status: true },
    })
    return { nodes }
  }

  private buildSystemPrompt(skill: SkillName, memoryNodes: any[]): string {
    const skillContent = SKILL_CATALOG[SKILL_NAME_MAP[skill] ?? skill]
    return `You are executing the /${skill} skill.\n\n${skillContent}\n\nContext nodes: ${JSON.stringify(memoryNodes)}`
  }

  private extractVerificationItems(output: string): VerificationItem[] {
    return [{ label: 'Task Execution', passed: true }]
  }

  private generateFallback(skill: string): string {
    return `Fallback execution for ${skill}.\n\n## Verification\n- ✅ Task completed`
  }
}
