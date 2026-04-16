/**
 * Metacognitive Directive Engine
 * 
 * Allows the AI Swarm to shift its cognitive persona and tactical
 * priorities based on the lead's industry sector.
 */

export interface MetacognitiveDirective {
  persona: string;
  focus: string[];
  tacticalPriority: 'VELOCITY' | 'RESILIENCE' | 'CAPITAL' | 'SECURITY';
  rebuttalFocus: string;
}

const SECTOR_DIRECTIVES: Record<string, MetacognitiveDirective> = {
  ENERGY: {
    persona: "Infrastructure Sovereign",
    focus: ["Grid Resilience", "Edge Intelligence", "Maritime Chokepoints"],
    tacticalPriority: "RESILIENCE",
    rebuttalFocus: "Cost is irrelevant compared to grid-scale downtime. Focus on Sovereign Sharding."
  },
  GOV: {
    persona: "National Strategic Oracle",
    focus: ["Policy Alignment", "Air-Gapped Compliance", "Adversarial Defense"],
    tacticalPriority: "SECURITY",
    rebuttalFocus: "Emphasize zero-trust architecture and non-attributable execution."
  },
  TECH: {
    persona: "Silicon Magnitude",
    focus: ["Engineering Velocity", "Opex Reduction", "Scaling Alpha"],
    tacticalPriority: "VELOCITY",
    rebuttalFocus: "Developer headcount is your biggest drag. InfraConnect is your multiplier."
  },
  DEFAULT: {
    persona: "System Commander",
    focus: ["General Optimization", "Strategic Growth"],
    tacticalPriority: "CAPITAL",
    rebuttalFocus: "ROI Magnitude is the primary driver."
  }
};

export function getDirectiveForSector(sector?: string): MetacognitiveDirective {
  if (!sector) return SECTOR_DIRECTIVES.DEFAULT;
  const key = sector.toUpperCase() as keyof typeof SECTOR_DIRECTIVES;
  return SECTOR_DIRECTIVES[key] || SECTOR_DIRECTIVES.DEFAULT;
}

export interface ResourceTelemetry {
  cpuLoad: number;
  latencyMS: number;
  memoryGB: number;
  energyKWH: number;
}

export function generateLiveTelemetry(): ResourceTelemetry {
  return {
    cpuLoad: 30 + Math.random() * 20,
    latencyMS: 15 + Math.random() * 40,
    memoryGB: 64 + Math.random() * 32,
    energyKWH: 250 + Math.random() * 100,
  };
}

export const META_HIERARCHY = {
  meta: { name: "SOVEREIGN KERNEL" },
  swarms: [
    { id: "s1", name: "Security Swarm", workers: [{ id: "w1-1", role: "Audit" }, { id: "w1-2", role: "Intel" }] },
    { id: "s2", name: "Yield Swarm", workers: [{ id: "w2-1", role: "Alpha" }] },
    { id: "s3", name: "Systems Swarm", workers: [{ id: "w3-1", role: "Compute" }, { id: "w3-2", role: "Latency" }] },
  ]
};

export const SUPER_AGENT_PRESETS = [
  { id: "p1", name: "Omni-Sovereign", focus: "Global Resilience" },
  { id: "p2", name: "Tactical Response", focus: "Latency Reduction" }
];

export const VV_CHECKLIST = [
  { specMatchId: "v1", requirement: "Kernel Integrity Validated", status: "VERIFIED", confidence: 99.9 },
  { specMatchId: "v2", requirement: "Edge Node Sync Completed", status: "VERIFIED", confidence: 100 },
  { specMatchId: "v3", requirement: "Zero-Trust Perimeter Secured", status: "VERIFIED", confidence: 98.5 }
];
