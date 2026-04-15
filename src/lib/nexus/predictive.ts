/**
 * Advanced Predictive Orchestrator
 * Maps user intent keywords to high-fidelity situational toolsets.
 */

export interface ToolsetWidget {
  id: string;
  title: string;
  type: 'chart' | 'detail' | 'matrix' | 'legal' | 'market' | 'radar'| 'threat' | 'energy' | 'generic' | 'swarm' | 'strategic' | 'pipeline' | 'adaptive';
}

export const SITUATIONAL_TOOLSETS: Record<string, ToolsetWidget[]> = {
  'HORMUZ': [
    { id: 'oil-index', title: 'OIL RISK MATRIX', type: 'matrix' },
    { id: 'vessel-hub', title: 'VESSEL DETAIL HUB', type: 'detail' },
    { id: 'brent-chart', title: 'OIL PRICE FOCUS', type: 'chart' },
  ],
  'LOGISTICS': [
    { id: 'vessel-hub', title: 'GLOBAL VESSEL TRACKER', type: 'detail' },
    { id: 'route-meta', title: 'ROUTE OPTIMIZER', type: 'generic' },
  ],
  'SUEZ': [
    { id: 'vessel-hub', title: 'SUEZ CANAL STATUS', type: 'detail' },
    { id: 'wait-matrix', title: 'TRANSIT WAIT TIMES', type: 'matrix' },
  ],
  'ENERGY': [
    { id: 'grid-health', title: 'GRID STABILITY LENS', type: 'chart' },
    { id: 'well-tracker', title: 'GLOBAL EXTRACTION TRACKER', type: 'energy' },
  ],
  'LAW': [
    { id: 'uk-legal', title: 'UK CORPORATE LAW INTEL', type: 'legal' },
    { id: 'eu-reg', title: 'EU REGULATORY FEED', type: 'legal' },
    { id: 'gdpr-monitor', title: 'GDPR COMPLIANCE RADAR', type: 'legal' },
  ],
  'THREAT': [
    { id: 'econ-radar', title: 'ECONOMIC COLLAPSE RADAR', type: 'threat' },
    { id: 'debt-velocity', title: 'DEBT VELOCITY ANALYSIS', type: 'chart' },
  ],
  'RADARSAT': [
    { id: 'sar-log', title: 'RADARSAT-3 SAR LOG', type: 'radar' },
    { id: 'dark-vessel', title: 'DARK VESSEL DETECTION', type: 'detail' },
  ],
  'SMR': [
    { id: 'smr-tracker', title: 'GLOBAL SMR DEPLOYMENT', type: 'energy' },
    { id: 'china-auto', title: 'AUTOMATION SURGE INDEX', type: 'chart' },
  ],
  'SWARM': [
     { id: 'swarm-exec', title: 'SWARM AGENT ORCHESTRATION', type: 'swarm' },
     { id: 'strategic-report', title: 'BOARDROOM BRIEFING DECK', type: 'strategic' },
  ],
  'MCKINSEY': [
     { id: 'adaptive-swarm', title: 'MCKINSEY REPLACEMENT HUB', type: 'adaptive' },
     { id: 'strategic-report', title: 'EXECUTIVE ROI BRIEFING', type: 'strategic' },
  ],
  'PIPELINE': [
     { id: 'deal-pipeline', title: 'ENTERPRISE DEAL PIPELINE', type: 'pipeline' },
     { id: 'rev-forecast', title: 'REVENUE FORECAST', type: 'chart' },
  ],
  'MASTER': [
     { id: 'adaptive-swarm', title: 'ADAPTIVE DELEGATION HUB', type: 'adaptive' },
     { id: 'exec-function', title: 'EXECUTIVE STRATEGY LAYER', type: 'adaptive' },
  ],
  'PLAN': [
     { id: 'adaptive-swarm', title: 'ORCHESTRATION COGNITION', type: 'adaptive' },
  ],
  'DELEGATE': [
     { id: 'adaptive-swarm', title: 'MASTER-WORKER DISPATCHER', type: 'adaptive' },
  ],
  'META': [
     { id: 'meta-agent', title: 'META ORCHESTRATOR HUB', type: 'meta' },
     { id: 'validation-ctx', title: 'V&V CORE REPORT', type: 'validation' },
  ],
  'VALIDATE': [
     { id: 'validation-ctx', title: 'SYSTEM SPEC VALIDATOR', type: 'validation' },
  ],
  'RESOURCE': [
     { id: 'validation-ctx', title: 'ENERGY & MEMORY METRICS', type: 'validation' },
  ],
  'SUPER AGENT': [
     { id: 'meta-agent', title: 'SUPER AGENT EXECUTION', type: 'meta' },
     { id: 'validation-ctx', title: 'SUPER AGENT AUDIT', type: 'validation' },
  ]
};

export function getGroupedWidgets(prompt: string): ToolsetWidget[] | null {
  const upperPrompt = prompt.toUpperCase();
  
  for (const [keyword, widgets] of Object.entries(SITUATIONAL_TOOLSETS)) {
    if (upperPrompt.includes(keyword)) {
      return widgets;
    }
  }
  
  return null;
}
