export type Policy = {
  modality:   string
  threshold:  number
  comparison: 'gt' | 'lt' | 'eq'
  action:     'warn' | 'stop' | 'kill'
}

class ConstraintEngine {
  private policies: Map<string, Policy> = new Map()
  private onViolation: ((id: string, val: number, thresh: number) => void) | null = null

  start(onViolation: (id: string, val: number, thresh: number) => void) {
    this.onViolation = onViolation
    console.log('[ConstraintEngine] Initialized')
    
    // Seed with default safety policies
    this.updatePolicy([
      { modality: 'latency', threshold: 500, comparison: 'gt', action: 'warn' },
      { modality: 'gpu_temp', threshold: 85,  comparison: 'gt', action: 'stop' },
    ])
  }

  updatePolicy(newPolicies: Policy[]) {
    newPolicies.forEach(p => {
      this.policies.set(p.modality, p)
    })
    console.log(`[ConstraintEngine] Policies synchronized: ${this.policies.size} active`)
  }

  check(modality: string, value: any) {
    const policy = this.policies.get(modality)
    if (!policy || typeof value !== 'number') return

    let violated = false
    if (policy.comparison === 'gt' && value >  policy.threshold) violated = true
    if (policy.comparison === 'lt' && value <  policy.threshold) violated = true
    if (policy.comparison === 'eq' && value === policy.threshold) violated = true

    if (violated && this.onViolation) {
      this.onViolation(modality, value, policy.threshold)
    }
  }

  triggerSafetyStop(modality: string) {
    const policy = this.policies.get(modality)
    if (policy?.action === 'stop' || policy?.action === 'kill') {
      console.warn(`[ConstraintEngine] SAFETY STOP ENGAGED: Triggered by ${modality}`)
      // In production: process.emit('safety_shutdown') or talk to robot controller
    }
  }
}

export const constraintEngine = new ConstraintEngine()
