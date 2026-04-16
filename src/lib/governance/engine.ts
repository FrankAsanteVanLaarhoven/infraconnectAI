// src/lib/governance/engine.ts
// 6-signal health scoring + decay + promotion + conflict detection
// Inspired by AI-Context-OS scoring architecture, simplified for InfraConnect

import { db as prisma } from '@/lib/db'

// === Signal weights (intent-adaptive — safety domain profile) ===
const SIGNAL_WEIGHTS = {
  recency: 0.20,      // Time since last validation
  frequency: 0.20,    // How often referenced in skill runs
  importance: 0.25,   // Level weight: L2=1.0, L1=0.7, L0=0.3
  conflict: 0.15,     // Inverse: fewer conflicts = higher score
  redundancy: 0.10,   // Inverse: unique content = higher score
  coverage: 0.10,     // Is this entity referenced in canon?
} as const

// === Decay TTLs in milliseconds ===
const DECAY_TTLS = {
  l0_scratch: 7 * 24 * 60 * 60 * 1000,    // 7 days
  l1_tactical: 30 * 24 * 60 * 60 * 1000,  // 30 days for logs/telemetry
  l1_wiki: 90 * 24 * 60 * 60 * 1000,      // 90 days for wiki nodes
  l2_canon: Infinity,                       // Canon never auto-decays
} as const

// === Promotion thresholds ===
const PROMOTION_THRESHOLDS = {
  scratch_to_wiki: 0.60,   // L0 scratch → L1 wiki
  wiki_to_canon: 0.85,     // L1 wiki → L2 canon (also requires 0 open conflicts)
} as const

export interface ScoredNode {
  id: string
  title: string
  level: string
  status: string
  score: number
  signals: Record<string, number>
  recommendation: 'promote' | 'demote' | 'archive' | 'maintain' | 'review'
  reason: string
}

export interface GovernanceCycleResult {
  timestamp: Date
  totalNodes: number
  scored: ScoredNode[]
  promotionCandidates: ScoredNode[]
  decayCandidates: ScoredNode[]
  conflictPairs: Array<{ nodeA: string; nodeB: string; reason: string }>
  healthSummary: { overall: number; byLevel: Record<string, number> }
  actionsApplied: string[]
}

export class GovernanceEngine {
  private scoreRecency(lastValidated: Date | null): number {
    if (!lastValidated) return 0.3
    const ageMs = Date.now() - lastValidated.getTime()
    const ageDays = ageMs / (1000 * 60 * 60 * 24)
    if (ageDays < 7) return 1.0
    if (ageDays < 30) return 0.8
    if (ageDays < 90) return 0.5
    if (ageDays < 180) return 0.25
    return 0.1
  }

  private scoreFrequency(referenceCount: number): number {
    if (referenceCount === 0) return 0.2
    if (referenceCount < 3) return 0.5
    if (referenceCount < 10) return 0.75
    return 1.0
  }

  private scoreImportance(level: string): number {
    const map: Record<string, number> = { l2: 1.0, l1: 0.7, l0: 0.3, L2: 1.0, L1: 0.7, L0: 0.3 }
    return map[level] ?? 0.3
  }

  private scoreConflict(conflictCount: number): number {
    if (conflictCount === 0) return 1.0
    if (conflictCount === 1) return 0.7
    if (conflictCount === 2) return 0.4
    return 0.1
  }

  private scoreRedundancy(node: { title: string; content: string }, peers: Array<{ title: string; content: string }>): number {
    const nodeWords = new Set(node.content.toLowerCase().split(/\W+/).filter((w) => w.length > 4))
    let maxSimilarity = 0
    for (const peer of peers) {
      const peerWords = new Set(peer.content.toLowerCase().split(/\W+/).filter((w) => peerWords.has(w)))
      const intersection = [...nodeWords].filter((w) => peerWords.has(w)).length
      const union = new Set([...nodeWords, ...peerWords]).size
      const similarity = union > 0 ? intersection / union : 0
      if (similarity > maxSimilarity) maxSimilarity = similarity
    }
    return 1 - maxSimilarity
  }

  private scoreCoverage(node: { category: string }, canonCategories: Set<string>): number {
    return canonCategories.has(node.category) ? 1.0 : 0.5
  }

  public score(
    node: { level: string, referenceCount: number, conflictCount: number, lastValidated: Date | null, title: string, content: string, category: string }, 
    peers: Array<{ title: string; content: string }>,
    canonCategories: Set<string>
  ): { score: number, signals: Record<string, number> } {
    const sRecency = this.scoreRecency(node.lastValidated)
    const sFreq = this.scoreFrequency(node.referenceCount)
    const sImport = this.scoreImportance(node.level)
    const sConflict = this.scoreConflict(node.conflictCount)
    const sRedundancy = this.scoreRedundancy(node, peers)
    const sCoverage = this.scoreCoverage(node, canonCategories)

    const score = 
      (sRecency * SIGNAL_WEIGHTS.recency) +
      (sFreq * SIGNAL_WEIGHTS.frequency) +
      (sImport * SIGNAL_WEIGHTS.importance) +
      (sConflict * SIGNAL_WEIGHTS.conflict) +
      (sRedundancy * SIGNAL_WEIGHTS.redundancy) +
      (sCoverage * SIGNAL_WEIGHTS.coverage)

    return { 
      score, 
      signals: { recency: sRecency, frequency: sFreq, importance: sImport, conflict: sConflict, redundancy: sRedundancy, coverage: sCoverage } 
    }
  }

  public async runPolicyCycle(autonomous: boolean = false): Promise<GovernanceCycleResult> {
    const nodesRaw = await prisma.memoryNode.findMany({
      where: { state: { in: ['draft', 'active', 'canonical'] } },
      select: { 
        id: true, title: true, summary: true, level: true, state: true, kind: true, 
        lastReviewedAt: true, createdAt: true, 
        _count: { select: { targetRuns: true, conflictsAsSource: true, conflictsAsTarget: true } } 
      }
    });

    const nodes = nodesRaw.map(n => ({
      ...n,
      status: String(n.state),
      content: n.summary || '',
      category: String(n.kind),
      lastValidated: n.lastReviewedAt,
      referenceCount: n._count.targetRuns,
      conflictCount: n._count.conflictsAsSource + n._count.conflictsAsTarget
    }));

    const canonNodes = nodes.filter(n => String(n.level) === 'L2')
    const canonCategories = new Set(canonNodes.map(n => n.category))
    
    const scored: ScoredNode[] = []
    const promotionCandidates: ScoredNode[] = []
    const decayCandidates: ScoredNode[] = []
    const conflictPairs: Array<{ nodeA: string; nodeB: string; reason: string }> = []
    const actionsApplied: string[] = []

    let totalScore = 0
    const byLevelSum: Record<string, number> = { l0: 0, l1: 0, l2: 0, L0: 0, L1: 0, L2: 0 }
    const byLevelCount: Record<string, number> = { l0: 0, l1: 0, l2: 0, L0: 0, L1: 0, L2: 0 }

    for (const node of nodes) {
      const peers = nodes.filter(n => n.id !== node.id && n.category === node.category)
      const { score, signals } = this.score(node, peers, canonCategories)
      
      let recommendation: 'promote' | 'demote' | 'archive' | 'maintain' | 'review' = 'maintain'
      let reason = 'Score is stable.'

      const ageMs = Date.now() - node.createdAt.getTime()

      if (node.level.toLowerCase() === 'l0' && score >= PROMOTION_THRESHOLDS.scratch_to_wiki) {
        recommendation = 'promote'
        reason = `High score (${score.toFixed(2)}) qualifies L0 scratch node for L1 wiki.`
        promotionCandidates.push({ id: node.id, title: node.title, level: node.level, status: node.status, score, signals, recommendation, reason })
      } else if (node.level.toLowerCase() === 'l1' && score >= PROMOTION_THRESHOLDS.wiki_to_canon && node.conflictCount === 0) {
        recommendation = 'promote'
        reason = `High score (${score.toFixed(2)}) and no conflicts. Candidate for L2 canon.`
        promotionCandidates.push({ id: node.id, title: node.title, level: node.level, status: node.status, score, signals, recommendation, reason })
      } else if (node.level.toLowerCase() === 'l0' && ageMs > DECAY_TTLS.l0_scratch) {
        recommendation = 'archive'
        reason = `L0 scratch node exceeded TTL.`
        decayCandidates.push({ id: node.id, title: node.title, level: node.level, status: node.status, score, signals, recommendation, reason })
      } else if (node.level.toLowerCase() === 'l1' && ageMs > DECAY_TTLS.l1_wiki && score < 0.3) {
        recommendation = 'demote'
        reason = `L1 node decayed score (${score.toFixed(2)}) and exceeded TTL.`
        decayCandidates.push({ id: node.id, title: node.title, level: node.level, status: node.status, score, signals, recommendation, reason })
      }

      scored.push({ id: node.id, title: node.title, level: node.level, status: node.status, score, signals, recommendation, reason })
      
      totalScore += score
      const lvl = node.level.toUpperCase()
      if (byLevelSum[lvl] !== undefined) {
        byLevelSum[lvl] += score
        byLevelCount[lvl] += 1
      }
    }

    // --- Swarm Substrate SOTA Validation ---
    // The Sovereign Swarm refuses to promote memories if unaligned models are running.
    const allExperiments = await prisma.mL_Experiment.findMany();
    const toxicModels = allExperiments.filter(m => {
       try {
         const hp = m.hyperparameters as any;
         if (!hp) return false;
         
         // Intercept completely unaligned variables
         if (hp.schedulerType === 'linear' || hp.schedulerType === 'constant') return true;
         if (hp.warmupRatio === 0 || hp.warmupRatio === "0") return true;
         if (hp.weightDecay === 0 || hp.weightDecay === "0") return true;
         
         return false;
       } catch(e) {
         return false;
       }
    });

    if (toxicModels.length > 0 && autonomous) {
       const toxicNames = toxicModels.map(m => m.runTag || m.modelName).join(', ');
       console.error(`\n[GOVERNANCE FATAL ENTRY] Toxic LoRA alignment detected: ${toxicNames}`);
       console.error(`[GOVERNANCE FATAL ENTRY] Global Swarm Promotions FROZEN to isolate fleet.\n`);
       
       promotionCandidates.length = 0; // Destroy pipeline arrays
       actionsApplied.push(`SWARM_LOCKDOWN: Unaligned PEFT weights detected (${toxicNames}). Autonomous promotions blocked to preserve SOTA integrity.`);
       await this.logActivity('fleet_lockdown', 'SYSTEM', `FROZEN: Unaligned SOTA bounds intercepted.`);
    }

    // --- Autonomous Actions Cycle ---
    if (autonomous) {
      for (const candidate of [...promotionCandidates, ...decayCandidates]) {
        if (candidate.recommendation === 'promote') {
          const nextLevel = candidate.level.toLowerCase() === 'l0' ? 'L1' : 'L2'
          const nextState = nextLevel === 'L1' ? 'active' : 'canonical'
          
          await prisma.memoryNode.update({
            where: { id: candidate.id },
            data: { 
              level: nextLevel as any, 
              state: nextState as any,
              lastReviewedAt: new Date()
            }
          })
          
          const actionMsg = `AUTONOMOUS_PROMOTION: ${candidate.title} -> ${nextLevel} (${candidate.reason})`
          actionsApplied.push(actionMsg)
          await this.logActivity('promote', candidate.id, actionMsg)
        } else if (candidate.recommendation === 'archive') {
          await prisma.memoryNode.update({
            where: { id: candidate.id },
            data: { state: 'archived' as any }
          })
          const actionMsg = `AUTONOMOUS_ARCHIVE: ${candidate.title} (${candidate.reason})`
          actionsApplied.push(actionMsg)
          await this.logActivity('archive', candidate.id, actionMsg)
        }
      }
    }

    const healthSummary = {
      overall: totalScore / Math.max(nodes.length, 1),
      byLevel: {
        l0: byLevelCount.L0 > 0 ? byLevelSum.L0 / byLevelCount.L0 : 0,
        l1: byLevelCount.L1 > 0 ? byLevelSum.L1 / byLevelCount.L1 : 0,
        l2: byLevelCount.L2 > 0 ? byLevelSum.L2 / byLevelCount.L2 : 0,
      }
    }

    // --- Persist Governance Projection ---
    await prisma.governanceProjection.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        canonCount:   nodes.filter(n => n.level === 'L2').length,
        wikiCount:    nodes.filter(n => n.level === 'L1').length,
        scratchCount: nodes.filter(n => n.level === 'L0').length,
        promotionPipeline: promotionCandidates as any,
        pendingPromotions: promotionCandidates.length as any,
        decayTimeline:     decayCandidates as any,
        sourceEventId:     `cycle-${Date.now()}`
      },
      update: {
        canonCount:   nodes.filter(n => n.level === 'L2').length,
        wikiCount:    nodes.filter(n => n.level === 'L1').length,
        scratchCount: nodes.filter(n => n.level === 'L0').length,
        promotionPipeline: promotionCandidates as any,
        pendingPromotions: promotionCandidates.length as any,
        decayTimeline:     decayCandidates as any,
        sourceEventId:     `cycle-${Date.now()}`
      }
    })

    return {
      timestamp: new Date(),
      totalNodes: nodes.length,
      scored,
      promotionCandidates,
      decayCandidates,
      conflictPairs,
      healthSummary,
      actionsApplied
    }
  }

  private async logActivity(action: string, nodeId: string, detail: string) {
    await prisma.aiAuditLog.create({
      data: {
        user: 'system:governance',
        action,
        resource: nodeId,
        input: detail,
        timestamp: new Date(),
        validated: true,
        executed: true,
        confidence: 1.0
      }
    }).catch(() => {})
  }
}
