"use client";

/**
 * Swarm Agent Logic Engine
 * 
 * Defines the strategic research agents and their simulated outputs 
 * based on McKinsey/Palantir-grade briefings.
 */

export interface StrategicAgent {
  id: string;
  name: string;
  category: string;
  status: 'waiting' | 'in_progress' | 'synthesizing' | 'completed';
  progress: number;
  timeElapsed: string;
  findings: string[];
  geospatial?: {
    lat: number;
    lng: number;
    targetBusiness?: string;
    nodeUrn: string;
  };
}

export const STRATEGIC_AGENTS: StrategicAgent[] = [
  { 
    id: 'agent-ops', 
    name: 'Research: AI in Operations', 
    category: 'Operations', 
    status: 'waiting', 
    progress: 0, 
    timeElapsed: '0s',
    findings: [
      'Digital Twin ROI: Unilever $52M annual savings.',
      'Predictive Maintenance: IoT sensors (vibration/temp) achieving 90%+ accuracy.',
      'Legacy ERP Fragmentation: Disparate datasets identified as the primary barrier to EBIT growth.',
      'Demand Prediction: Ingesting macro/weather variables for 20-50% accuracy gain.'
    ],
    geospatial: {
      lat: 51.524,
      lng: -0.113,
      targetBusiness: 'NEURO_GEN SYSTEMS',
      nodeUrn: 'urn:asset:node:frank-station'
    }
  },
  { 
    id: 'agent-support', 
    name: 'Research: AI in Customer Support', 
    category: 'Customer Support', 
    status: 'waiting', 
    progress: 0, 
    timeElapsed: '0s',
    findings: [
      '$3.7 Trillion in global sales at risk from poor CX.',
      'Attrition rates: 30-45% in legacy contact centers.',
      'Resolution efficiency: 80% improvement via Agentic AI.'
    ],
    geospatial: {
      lat: 35.681,
      lng: 139.767,
      targetBusiness: 'SMR_QUANTUM FLEET',
      nodeUrn: 'urn:asset:node:edge-01'
    }
  },
  { 
    id: 'agent-dev', 
    name: 'Research: AI in Product Dev', 
    category: 'Product Development', 
    status: 'waiting', 
    progress: 0, 
    timeElapsed: '0s',
    findings: [
      'R&D cycles: Accelerated by 5x using virtual simulations.',
      'Rapid Prototyping: Material waste reduced by 35%.'
    ],
    geospatial: {
      lat: 37.774,
      lng: -122.419,
      targetBusiness: 'BIOME_INTEL CORE',
      nodeUrn: 'urn:asset:node:frank-station'
    }
  }
];


export const FIVE_FACTORS = [
  { id: '01', title: 'Data as Strategic Infrastructure', desc: 'Unified data foundation unlocks Simultaneous innovation.', icon: 'database' },
  { id: '02', title: 'Process Redesign Over Tooling', desc: 'Design workflows around AI capabilities - don\'t layer AI onto broken processes.', icon: 'refresh-cw' },
  { id: '03', title: 'Human-AI Collaboration', desc: 'Augmentation outperforms both pure automation and pure manual work.', icon: 'users' },
  { id: '04', title: 'C-Suite-Led Governance', desc: 'CEO oversight is strongly correlated with higher EBIT impact.', icon: 'shield' },
  { id: '05', title: 'Phased, Value-Driven Implementation', desc: 'Quick wins build momentum; systematic scaling with clear ROI.', icon: 'trending-up' },
];

export interface Deal {
  id: string;
  name: string;
  value: number;
  stage: 'PROSPECTING' | 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED WON' | 'CLOSED LOST';
  agent: string;
  probability: number;
}

export const DEAL_PIPELINE: Deal[] = [
  { id: 'd1', name: 'Global Logistics Revamp - Tier 1', value: 12500000, stage: 'PROPOSAL', agent: 'agent-ops', probability: 65 },
  { id: 'd2', name: 'Predictive Maintenance Rollout', value: 8400000, stage: 'NEGOTIATION', agent: 'agent-ops', probability: 85 },
  { id: 'd3', name: 'Agentic Support Transformation', value: 4200000, stage: 'CLOSED WON', agent: 'agent-support', probability: 100 },
  { id: 'd4', name: 'Demand Prediction Engine V2', value: 2100000, stage: 'QUALIFICATION', agent: 'agent-ops', probability: 40 },
  { id: 'd5', name: 'SMR Site Preparation - Phase 1', value: 45000000, stage: 'PROSPECTING', agent: 'agent-dev', probability: 15 },
  { id: 'd6', name: 'GDPR Compliance Automation', value: 1800000, stage: 'CLOSED LOST', agent: 'agent-finance', probability: 0 },
];

/**
 * Adaptive Swarm Master Orchestration
 */
export interface MasterWorker {
  id: string;
  role: string;
  capability: string;
  progress: number;
}

export const WORKER_STACK: MasterWorker[] = [
  { id: 'w1', role: 'TERMINAL', capability: 'System Execution', progress: 93 },
  { id: 'w2', role: 'CODE GEN', capability: 'SOTA Logic Synthesis', progress: 84 },
  { id: 'w3', role: 'WEB SEARCH', capability: 'Real-time Intel Extraction', progress: 75 },
  { id: 'w4', role: 'FILE MGMT', capability: 'Data Sharding & Storage', progress: 68 },
  { id: 'w5', role: 'IMAGE GEN', capability: 'Cinematic Visual Synthesis', progress: 57 },
  { id: 'w6', role: 'DEPLOYMENT', capability: 'Global Infrastructure Push', progress: 48 },
  { id: 'w7', role: 'GEMMA-9B', capability: 'Sovereign Inference Core', progress: 100 },
];

/**
 * Singularity-Grade Model Registry
 */
export const MODEL_REGISTRY = [
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro (Jitro Core)', provider: 'GOOGLE', class: 'FRONTIER', benchmark: 'JITRO 2035' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Jitro Substrate)', provider: 'GOOGLE', class: 'FRONTIER', benchmark: 'JITRO 2035' },
  { id: 'gemma4-31b-dense', name: 'Gemma-4-31B Dense', provider: 'LOCAL', class: 'SOVEREIGN', benchmark: 'CONCURRENT 2035' },
  { id: 'gemma4-26b-moe', name: 'Gemma-4-26B (MoE)', provider: 'LOCAL', class: 'SOVEREIGN', benchmark: 'CONCURRENT 2035' },
  { id: 'deepseek-v3', name: 'DeepSeek-V3', provider: 'OPEN', class: 'RESEARCH', benchmark: 'PRO 2025' }
];

export interface StrategicOutcome {
  id: string;
  goal: string;
  kpi: string;
  target: number;
  current: number;
  status: 'PLANNING' | 'EXECUTING' | 'VALIDATING' | 'ACHIEVED';
  persistent: boolean;
}

export const STRATEGIC_OUTCOMES: StrategicOutcome[] = [
  { 
    id: 'goal-01', 
    goal: 'Increase Fleet Throughput', 
    kpi: 'Tokens/Sec', 
    target: 250, 
    current: 172.1, 
    status: 'EXECUTING', 
    persistent: true 
  },
  { 
    id: 'goal-02', 
    goal: 'SMR Site Optimization', 
    kpi: 'EBIT Efficiency', 
    target: 0.95, 
    current: 0.82, 
    status: 'PLANNING', 
    persistent: true 
  }
];



export const SHARED_ARCHITECTURE = [
  { id: 'arch-db', title: 'DATABASE SCHEMA', desc: 'SAME TABLES · SAME RELATIONS', icon: 'database' },
  { id: 'arch-auth', title: 'AUTH SYSTEM', desc: 'SAME TOKENS · SAME SESSIONS', icon: 'shield' },
  { id: 'arch-design', title: 'DESIGN LANGUAGE', desc: 'SAME COLORS · SAME COMPONENTS', icon: 'palette' },
];

export const COGNITIVE_MODEL = {
  header: 'PREFRONTAL CORTEX',
  subHeader: 'EXECUTIVE FUNCTION',
  domains: ['ENGINEERING', 'RESEARCH', 'DATA', 'DESIGN', 'DEPLOYMENT']
};
