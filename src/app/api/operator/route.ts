import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
});

export async function POST(req: Request) {
  try {
    const { input, lead } = await req.json();

    if (!input || !lead) {
      return NextResponse.json({ error: "Input and Lead data required" }, { status: 400 });
    }

    // 1. Rewrite Engine
    const rewritePrompt = `
You are a master strategic deal closer. Rewrite this email to be sharper, more confident, and tailored to the buyer's profile.

Context:
- Company: ${lead.company || "Enterprise Target"}
- Role: ${lead.role || "Executive Decision Maker"}
- Score: ${lead.score}
- Behavior: ${lead.visitedDemo ? "Has seen demo" : "No demo"}, ${lead.viewedSecurity ? "Has seen security" : "No security"}

Original Message:
${input}

Rewrite it to be under 100 words, surgically precise, and focus on the value of autonomous control.
`;

    // 2. Buyer Simulation
    const simulatePrompt = `
You are the buyer (Role: ${lead.role || 'Executive'}, Company: ${lead.company || 'Enterprise Target'}).
You are evaluating infrastructure and AI orchestration tools.

Read the rewritten email below and provide:
1. Likelihood to reply (0-100)
2. Likely reaction (1-2 sentences)
3. One potential objection we should prepare for.

Email:
[CONTENT_WILL_BE_REWRITTEN_VERSION]
`;

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy") {
      return NextResponse.json({
        rewrite: "Mock Rewrite: This is a surgical, high-end version of your message focused on security and control.",
        simulation: {
          likelihood: 75,
          reaction: "The buyer is intrigued by the VPC-native approach but concerned about legacy compatibility.",
          objection: "How does this integrate with our current air-gapped systems?"
        },
        final: "Final Optimized Version: Ready for dispatch."
      });
    }

    const rewriteRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: rewritePrompt }],
    });
    const rewriteContent = rewriteRes.choices[0].message.content;

    const simulateRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: simulatePrompt.replace("[CONTENT_WILL_BE_REWRITTEN_VERSION]", rewriteContent || "") }],
    });
    const simulationContent = simulateRes.choices[0].message.content;

    return NextResponse.json({
      rewrite: rewriteContent,
      simulation: simulationContent,
      final: rewriteContent // For now, the final version is the rewritten content
    });

  } catch (error) {
    console.error("[API_OPERATOR_ERROR]", error);
    return NextResponse.json({ error: "Decision engine failure" }, { status: 500 });
  }
}
