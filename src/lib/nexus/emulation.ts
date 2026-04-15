"use client";

/**
 * Strategic Rehearsal Nexus: Behavioral Substrate
 * 
 * This engine manages thousands of concurrent "Cognitive Proxies"
 * within a parallel digital reality. It facilitates emergent prediction
 * through state-space modeling.
 */

export interface PredictionSwarmAgent {
    id: string;
    personality: 'AGGRESSIVE' | 'CAUTIOUS' | 'STABLE' | 'ERRATIC';
    memory: string[];
    sentiment: number; // -1 to 1
    state: 'DECIDING' | 'REACTING' | 'STABLE';
}

export interface ParallelRealitySnapshot {
    timestamp: string;
    agentCount: number;
    convergenceScore: number; // 0 to 1
    primaryOutcome: string;
    predictedGrowth: number;
}

export const INITIAL_PROXIES: PredictionSwarmAgent[] = Array.from({ length: 50 }).map((_, i) => ({
    id: `proxy-${i}`,
    personality: ['AGGRESSIVE', 'CAUTIOUS', 'STABLE', 'ERRATIC'][Math.floor(Math.random() * 4)] as any,
    memory: ['Baseline reality established.'],
    sentiment: 0.5,
    state: 'STABLE'
}));


export const DISRUPTOR_SEEDS = [
    { id: 'volatility', label: 'MARKET VOLATILITY', intensity: 0.8, type: 'ECONOMIC' },
    { id: 'policy', label: 'POLICY SHIFT [X-29]', intensity: 0.6, type: 'REGULATORY' },
    { id: 'competitor', label: 'COMPETITOR DISRUPTION', intensity: 0.7, type: 'MARKET' },
    { id: 'scarcity', label: 'RESOURCE SCARCITY', intensity: 0.9, type: 'OPERATIONAL' }
];

/**
 * Simulated Reality Logic
 */
export function simulateSocialEvolution(proxies: CognitiveProxy[], disruptor?: string): CognitiveProxy[] {
    return proxies.map(proxy => {
        const reactionFactor = disruptor ? Math.random() * 0.4 : 0.1;
        const newSentiment = Math.max(-1, Math.min(1, proxy.sentiment + (Math.random() - 0.5) * reactionFactor));
        
        return {
            ...proxy,
            sentiment: newSentiment,
            state: disruptor ? 'REACTING' : 'STABLE',
            memory: [...proxy.memory.slice(-3), disruptor ? `Reacted to ${disruptor}.` : 'Stable cycle.']
        };
    });
}
