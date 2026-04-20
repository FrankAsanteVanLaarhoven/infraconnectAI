import OpenAI from "openai";
import { MissionDAG } from "@/lib/dag-engine";
import { executeDAG } from "@/lib/dag-executor";

const API_KEY = process.env.OPENAI_API_KEY;

export async function constructMissionDAG(goal: string) {
    // Generate deterministic array of tasks
    let steps = [
        { id: "analyze", action: "Evaluate local unit hardware integrity" },
        { id: "isolate", action: "Partition faulty execution clusters" },
        { id: "deploy", action: "Redeploy stable parameters globally" }
    ];

    if (API_KEY) {
        try {
            const client = new OpenAI({ apiKey: API_KEY });
            const prompt = `Break this physical robotics goal into a 3-step physical pipeline: GOAL: ${goal}. Return ONLY a raw JSON array of strings. No markdown formatting. Example: ["Assess matrix", "Deploy lock", "Verify"]`;
            
            const res = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }]
            });

            const parsed = JSON.parse(res.choices[0].message.content || "[]");
            if (Array.isArray(parsed) && parsed.length > 0) {
                steps = parsed.map((str: string, i: number) => ({ id: `step-${i}`, action: str }));
            }
        } catch(e) {
            console.error("Mission DAG gen failed", e);
        }
    }

    const mission: MissionDAG = {
        id: `mission-${Date.now()}`,
        goal,
        nodes: steps.map(s => ({ ...s, status: "pending" as const })),
        edges: [] // Simplified linear edges for MVP [0->1, 1->2]
    };

    if (steps.length > 1) {
        for(let i=0; i<steps.length-1; i++){
            mission.edges.push({ from: steps[i].id, to: steps[i+1].id });
        }
    }

    // Execute asynchronously to unblock API
    executeDAG(mission).catch(e => console.error("DAG failure", e));
    
    return mission;
}
