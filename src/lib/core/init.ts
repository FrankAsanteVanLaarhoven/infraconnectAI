import { subscribe } from "./bus";
import { runAgents } from "@/lib/agents/engine";

// Importing isolated standalone agents bridging registration sequences dynamically
import "@/lib/agents/bidAgent";
import "@/lib/planning/dagExecutor";
import "@/lib/timeline/logger";
import "@/lib/cognitive/debateEngine";
import "@/lib/revenue/missionScore";
import { explainEvent } from "@/lib/cognitive/reasoningEngine";

/**
 * Universal initialisation boundary intercepting disparate structural elements directly onto the 
 * single cognitive array execution map securely tracking RL components.
 */
subscribe("*", async (event) => {
    // Passes isolated native memory arrays cleanly to registered autonomous elements
    await runAgents(event);

    // Exploit Generative explanations mapping tracking exclusively on macro shifts
    if (["tasks.assigned", "robots.bid", "robot.alerts", "mission.node.start", "system.calibration_run"].includes(event.type)) {
        await explainEvent(event);
    }
});
