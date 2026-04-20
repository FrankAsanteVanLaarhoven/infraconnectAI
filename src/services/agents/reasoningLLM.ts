import OpenAI from "openai";

// Graceful fallback if no exact key exists in development
const API_KEY = process.env.OPENAI_API_KEY;
let client: OpenAI | null = null;

if (API_KEY) {
  try {
     client = new OpenAI({ apiKey: API_KEY });
  } catch(e) {
     console.warn("OpenAI Client init failed", e);
  }
}

export async function generateReasoning(event: any, decision: string) {
  
  // Safe deterministic fallback when lacking live credits
  if (!client) {
     return `[AUTOMATED HEURISTIC] Standard operating limits exceeded for parameter class ${event.status || 'UNKNOWN'}. System defaulting to localized hardware protection routines (${decision}). This action prevents terminal thermal feedback loops across surrounding computational arrays. Recovery expected securely.`;
  }

  const prompt = `
You are an AI system operating humanoid robots.

Event Snapshot:
${JSON.stringify(event, null, 2)}

Hardcoded Security Decision:
${decision}

Explain:
1. Specifically why this decision was made regarding the active event metrics.
2. Risks to the physical edge node if not executed immediately.
3. Expected systemic outcome.

Keep it highly concise, under three sentences, using Palantir-tier military-industrial terminology.
`;
  
  try {
      const res = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      });

      return res.choices[0].message.content || 'LLM Generation failed; reverting to standard logging.';
  } catch (error) {
      console.warn("OpenAI Generation Error", error);
      return `[ERROR: LLM FETCH EXHAUSTED] Fallback resolution invoked. Enforcing structural parameters against localized asset.`;
  }
}
