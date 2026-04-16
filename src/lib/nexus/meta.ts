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
