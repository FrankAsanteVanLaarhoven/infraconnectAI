import { storeMemory } from "./memory";

export type ActionOutcome = {
    robotId: string;
    action: string;
    expectedState: Record<string, any>;
    actualState: Record<string, any>;
    source: "simulation" | "real";
};

/**
 * The Real/Sim Neural Feedback Loop Architecture.
 * Compares expected behavioral heuristics inside physics wrappers against true hardware deployment metrics.
 */
export async function evaluateTransferLoop(simOutcome: ActionOutcome, realOutcome: ActionOutcome) {
    // Basic heuristics intercept
    const thresholdDrift = 0.5;
    
    let physicsGapDetected = false;
    let divergenceMetrics = {};

    // Analyze theoretical physics delta
    for(const key of Object.keys(simOutcome.actualState)) {
        if(realOutcome.actualState[key] !== undefined) {
            const diff = Math.abs(simOutcome.actualState[key] - realOutcome.actualState[key]);
            
            if(diff > thresholdDrift) {
                physicsGapDetected = true;
                divergenceMetrics = { ...divergenceMetrics, [key]: diff };
            }
        }
    }

    if(physicsGapDetected) {
        console.log(`[TRANSFER_LOOP] Physics Engine Drift Identified for ${realOutcome.action}. Injecting gap heuristic ...`);
        
        await storeMemory("sim_vs_real_gap", {
            action: realOutcome.action,
            drift: divergenceMetrics,
            correctionPrompt: "Next execution, structurally augment geometry kinematics by applying inverted compensator matrix to offset hardware slop."
        });
    }

    return physicsGapDetected;
}
