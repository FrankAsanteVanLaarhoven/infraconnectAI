import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy", // Fallback to avoid crash if key is missing during build
});

import { vesselFleetEngine } from "@/lib/nexus/vesselFleetEngine";
import { environmentalEngine } from "@/lib/nexus/environmentalEngine";

/**
 * Generates context-aware enterprise outreach emails using OpenAI.
 * Injects maritime and environmental intelligence for surgical relevance.
 */
export async function generateSmartEmail(lead: {
  company?: string | null;
  role?: string | null;
  intent?: string | null;
  score: number;
  visitedDemo: boolean;
  viewedSecurity: boolean;
  message?: string | null;
}) {
  // Fetch Live Intelligence Context
  const darkVessels = vesselFleetEngine.detectDarkVessels().length;
  const ecoRisks = environmentalEngine.getMetrics().filter(m => m.status === 'CRITICAL').length;
  const planetaryRisk = environmentalEngine.getOverallPlanetaryRisk();

  const tacticalContext = `
- Maritime Risk: ${darkVessels} Dark/Deviating vessels detected in key chokepoints.
- Ecological Status: ${ecoRisks} critical anomalies active.
- Overall Planetary Stress Index: ${(planetaryRisk * 100).toFixed(1)}%
  `.trim();

  // If no API key, return a high-quality template fallback
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy") {
    return generateFallbackEmail(lead, tacticalContext);
  }

  const prompt = `
You are Frank Van Laarhoven, Founder of InfraConnect AI (infraconnect.ai).
Write a surgical, high-end enterprise outreach email to a potential client.

Lead Context:
- Company: ${lead.company || "Unknown"}
- Role: ${lead.role || "Executive"}
- Lead Intent: ${lead.intent || "High-Value Interaction"}
- Lead Health Score: ${lead.score}/100
- Behavior: ${lead.visitedDemo ? "Viewed live demo" : "Has not seen demo yet"}, ${lead.viewedSecurity ? "Deep-dived into security protocols" : "Has not reviewed security page yet"}
- Their Message: "${lead.message || "N/A"}"

Tactical Grid Context:
${tacticalContext}

Rules:
1. Tone: Confident, technical, and direct. No marketing fluff.
2. Length: Under 120 words.
3. Content: Focus on proximity to the May 2026 go-live. Use the Tactical Grid Context to drive urgency (e.g. supply chain risks or environmental volatility impacting their specific vertical).
4. Call to Action: Low-friction.
5. Personalization: Mention their specific behavior (demo/security) if applicable.

Write exactly the email body content:
`;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    return res.choices[0].message.content || generateFallbackEmail(lead, tacticalContext);
  } catch (error) {
    console.error("[AI_EMAIL_GEN_FAIL]", error);
    return generateFallbackEmail(lead, tacticalContext);
  }
}

function generateFallbackEmail(lead: any, tacticalContext: string) {
  const behaviorBonus = lead.visitedDemo ? " I saw you had a chance to look at the live demo." : "";
  const securityFocus = lead.viewedSecurity ? " Since you reviewed our security architecture, you'll know we prioritize VPC-native isolation." : "";
  
  const tacticalLine = tacticalContext.includes('Dark/Deviating') 
    ? "\n\nGiven the current maritime volatility in APAC and Hormuz, I've flagged your account for priority infrastructure shielding."
    : "\n\nWe are currently monitoring planetary-scale environmental telemetry to optimize upcoming energy deployment schedules.";

  if (lead.score > 70) {
    return `Hello,\n\nI noticed your interest in InfraConnect.${behaviorBonus}${securityFocus}${tacticalLine}\n\nWe are currently onboarding a select group of enterprise partners for our May 2026 deployment cycle. Given your focus, I'd like to ensure your environment is cleared for our initial rollout.\n\nAre you available for a brief technical walkthrough this week?\n\nBest,\nFrank Van Laarhoven\nFounder, InfraConnect`;
  }
  
  return `Hello,\n\nThank you for reaching out regarding InfraConnect.${behaviorBonus}${tacticalLine}\n\nWe are building the next generation of autonomous infrastructure control, launching in May 2026. I've flagged your interest for our technical team to review.\n\nBest,\nFrank Van Laarhoven\nFounder, InfraConnect`;
}
