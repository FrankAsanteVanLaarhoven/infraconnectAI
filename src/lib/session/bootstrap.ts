// src/lib/session/bootstrap.ts
// Token-budgeted, tiered context injection.
// This is the SOTA contribution: grounding agent sessions in governed memory.
// Directly implements the context-engineering SKILL.md hierarchy:
//   L2 canon  = Level 1 (Rules Files)   — always loaded
//   L1 wiki   = Level 2 (Spec/Arch)     — loaded per feature
//   L0 scratch= Level 4 (Error/WIP)     — loaded per iteration

import { db as prisma } from '@/lib/db'
import { SKILL_CONTRACTS, type SkillName } from '@/lib/memory/types'

// Token budgets per stratum (conservative for gpt-4o-mini 128k context)
const TOKEN_BUDGETS = {
  l2_canon: 2000,    // Non-negotiable — standards, playbooks, safety constraints
  l1_wiki: 3000,     // Grounding — decisions, entities, concepts
  l0_scratch: 500,   // Continuity — active WIP only
  skill_contract: 300,
  total: 6000,
} as const

export interface SessionContext {
  canonContext: ContextBlock[]
  wikiContext: ContextBlock[]
  wipContext: ContextBlock[]
  skillContract: SkillContractSummary | null
  tokenUsage: TokenUsage
  healthWarnings: string[]
  bootstrapMarkdown: string  // Ready to inject as system prompt prefix
}

interface ContextBlock {
  id: string
  title: string
  content: string
  level: string
  category: string
  tokenEstimate: number
}

interface SkillContractSummary {
  skill: SkillName
  reads: string[]
  writes: string[]
  constraints: string[]
}

interface TokenUsage {
  canon: number
  wiki: number
  wip: number
  total: number
  budgetRemaining: number
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

function truncateToTokenBudget(content: string, budgetTokens: number): string {
  const maxChars = budgetTokens * 4
  if (content.length <= maxChars) return content
  return content.slice(0, maxChars) + '\n\n[...truncated to fit token budget]'
}

export async function bootstrapSessionContext(
  intentText: string,
  skill?: SkillName
): Promise<SessionContext> {
  const healthWarnings: string[] = []

  // === L2 CANON — always load, highest priority ===
  const canonNodes = await prisma.memoryNode.findMany({
    where: { level: 'L2', status: 'canon' },
    orderBy: [{ healthScore: 'desc' }, { referenceCount: 'desc' }],
    take: 10,
    select: { id: true, title: true, content: true, level: true, category: true },
  })

  let canonTokensUsed = 0
  const canonContext: ContextBlock[] = []
  for (const node of canonNodes) {
    const available = TOKEN_BUDGETS.l2_canon - canonTokensUsed
    if (available <= 50) break
    const truncated = truncateToTokenBudget(node.content, available)
    const tokens = estimateTokens(node.title + truncated)
    canonContext.push({ ...node, content: truncated, tokenEstimate: tokens })
    canonTokensUsed += tokens
  }

  if (canonContext.length === 0) {
    healthWarnings.push('No L2 canon nodes found. Agent will operate without canonical standards.')
  }

  // === L1 WIKI — domain-matched, scored by relevance to intent ===
  const intentKeywords = intentText
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 4)

  const wikiNodes = await prisma.memoryNode.findMany({
    where: {
      level: 'L1',
      status: 'wiki',
      ...(skill && SKILL_CONTRACTS[skill]
        ? {}  // If skill known, we already filtered by contract reads in runner
        : {}),
    },
    orderBy: [{ healthScore: 'desc' }, { lastValidated: 'desc' }],
    take: 30,  // Over-fetch, then score
    select: { id: true, title: true, content: true, level: true, category: true, tags: true },
  })

  // Score wiki nodes by keyword overlap with intent
  const scoredWiki = wikiNodes
    .map((node) => {
      const nodeText = (node.title + ' ' + node.content + ' ' + (node.tags ?? '')).toLowerCase()
      const overlap = intentKeywords.filter((kw) => nodeText.includes(kw)).length
      return { ...node, relevanceScore: overlap }
    })
    .filter((n) => n.relevanceScore > 0 || wikiNodes.length <= 5)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 8)

  let wikiTokensUsed = 0
  const wikiContext: ContextBlock[] = []
  for (const node of scoredWiki) {
    const available = TOKEN_BUDGETS.l1_wiki - wikiTokensUsed
    if (available <= 50) break
    const truncated = truncateToTokenBudget(node.content, available)
    const tokens = estimateTokens(node.title + truncated)
    wikiContext.push({ ...node, content: truncated, tokenEstimate: tokens })
    wikiTokensUsed += tokens
  }

  // === L0 SCRATCH — active WIP only (non-expired) ===
  const wipNodes = await prisma.memoryNode.findMany({
    where: {
      level: 'L0',
      status: 'scratch',
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { updatedAt: 'desc' },
    take: 3,
    select: { id: true, title: true, content: true, level: true, category: true },
  })

  let wipTokensUsed = 0
  const wipContext: ContextBlock[] = []
  for (const node of wipNodes) {
    const available = TOKEN_BUDGETS.l0_scratch - wipTokensUsed
    if (available <= 50) break
    const truncated = truncateToTokenBudget(node.content, available)
    const tokens = estimateTokens(node.title + truncated)
    wipContext.push({ ...node, content: truncated, tokenEstimate: tokens })
    wipTokensUsed += tokens
  }

  // === SKILL CONTRACT SUMMARY ===
  let skillContract: SkillContractSummary | null = null
  if (skill && SKILL_CONTRACTS[skill]) {
    const c = SKILL_CONTRACTS[skill]
    skillContract = { skill, reads: c.reads, writes: c.writes, constraints: c.constraints }
  }

  // === BUILD BOOTSTRAP MARKDOWN ===
  const totalTokens = canonTokensUsed + wikiTokensUsed + wipTokensUsed

  const bootstrapMarkdown = buildBootstrapMarkdown({
    canonContext,
    wikiContext,
    wipContext,
    skillContract,
    intentText,
  })

  return {
    canonContext,
    wikiContext,
    wipContext,
    skillContract,
    tokenUsage: {
      canon: canonTokensUsed,
      wiki: wikiTokensUsed,
      wip: wipTokensUsed,
      total: totalTokens,
      budgetRemaining: TOKEN_BUDGETS.total - totalTokens,
    },
    healthWarnings,
    bootstrapMarkdown,
  }
}

function buildBootstrapMarkdown(opts: {
  canonContext: ContextBlock[]
  wikiContext: ContextBlock[]
  wipContext: ContextBlock[]
  skillContract: SkillContractSummary | null
  intentText: string
}): string {
  const sections: string[] = []

  sections.push(`# InfraConnect Session Context
*Auto-generated by Session Bootstrapper — do not edit manually*
*Task: ${opts.intentText}*`)

  if (opts.skillContract) {
    sections.push(`## Skill Contract: \/\${opts.skillContract.skill}
- **Reads**: \${opts.skillContract.reads.join(', ')}
- **Writes**: \${opts.skillContract.writes.join(', ')}
- **Constraints**: \${opts.skillContract.constraints.join('; ')}`)
  }

  if (opts.canonContext.length > 0) {
    sections.push(`## Canonical Standards (L2 — must follow)
\${opts.canonContext.map((n) => \`### \${n.title}\n\${n.content}\`).join('\n\n')}`)
  }

  if (opts.wikiContext.length > 0) {
    sections.push(`## Wiki Knowledge (L1 — grounding context)
\${opts.wikiContext.map((n) => \`### \${n.title}\n\${n.content}\`).join('\n\n')}`)
  }

  if (opts.wipContext.length > 0) {
    sections.push(`## Work In Progress (L0 — continuity)
\${opts.wipContext.map((n) => \`### \${n.title}\n\${n.content}\`).join('\n\n')}`)
  }

  return sections.join('\n\n---\n\n')
}
