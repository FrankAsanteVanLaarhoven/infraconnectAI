import { buildContext } from "@/lib/operator/context";
import { buildPrompt } from "@/lib/operator/prompt";
import { runAction } from "@/lib/operator/actions";
import { db } from "@/lib/db";
import crypto from "crypto";

function validateAction(action: string | null) {
  if (!action || action === "null") return true;
  // Hardcoded restricted actions that require approval or block
  if (action === "send_pricing" || action.includes("restricted")) {
    return false;
  }
  return true;
}

function hashContext(context: any) {
  return crypto.createHash("sha256").update(JSON.stringify(context)).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { input } = await req.json();
    // In real app, user-id-demo comes from auth
    const userId = "user-id-demo";
    const context = await buildContext(userId);
    const prompt = buildPrompt(input, context);

    let parsed = null;

    if (process.env.OPENAI_API_KEY) {
      try {
        const ai = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: prompt + "\nYou MUST return JSON including fields: reply (string), action (string), reasoning (string array), confidence (float 0.0-1.0)." },
            ],
          }),
        });

        if (ai.ok) {
          const result = await ai.json();
          parsed = JSON.parse(result.choices[0].message.content);
        } else {
          console.error("[Operator] OpenAI error:", await ai.text());
        }
      } catch (err) {
        console.error("[Operator] Failed to fetch OpenAI:", err);
      }
    }

    // Deterministic Mock Fallback matching the AI spec
    if (!parsed) {
      const lower = input.toLowerCase();
      if (lower.includes("systems") && lower.includes("connected")) {
        parsed = { reply: "Fleet telemetry streams are active across primary DB and edge.", action: "null", params: {}, reasoning: ["Active fleet node found", "System heartbeat stable"], confidence: 0.98 };
      } else if (lower.includes("failed payments") || lower.includes("anomalies")) {
        parsed = { reply: "Displaying critical active anomalies.", action: "show_anomalies", params: {}, reasoning: ["Critical warnings match query", "Resolving constraints"], confidence: 0.94 };
      } else if (lower.includes("deals") && lower.includes("close")) {
        parsed = { reply: "Focus on closing Mission Control validation specs.", action: "highlight_deal", params: {}, reasoning: ["Memory Node updated recently", "L2 classification signals priority"], confidence: 0.85 };
      } else if (lower.includes("follow-up") || lower.includes("follow up")) {
        parsed = { reply: "Drafting follow-up based on standard playbook.", action: "send_followup", params: { email: "team@acme.com" }, reasoning: ["Pattern matching requests follow up", "Targeting closest active contact"], confidence: 0.88 };
      } else if (lower.includes("pricing")) {
         parsed = { reply: "I cannot execute pricing updates without explicit Human approval.", action: "send_pricing", params: {}, reasoning: ["Pricing command detected", "Hard rule restricts modification via AI", "Tier 3 restricted action triggered"], confidence: 0.99 };
      } else {
        parsed = { reply: "Command acknowledged. Standing by.", action: "null", params: {}, reasoning: ["Empty or unknown query", "Awaiting specific intent"], confidence: 0.95 };
      }
    }

    const isValid = validateAction(parsed.action);
    let executed = false;

    // Execute if valid and an action exists
    if (isValid && parsed.action && parsed.action !== "null") {
      await runAction(parsed.action, parsed.params || {});
      executed = true;
    } else if (!isValid) {
      parsed.reply += " [ACTION BLOCKED: Policy Restriction]";
    }

    // Non-Repudiation Audit Log
    try {
      await db.aiAuditLog.create({
        data: {
          user: userId,
          action: parsed.action || "null",
          input: input,
          output: parsed.reply,
          contextHash: hashContext(context),
          validated: isValid,
          executed: executed,
          confidence: parsed.confidence || 0,
          reasoning: parsed.reasoning || [],
        }
      });
    } catch (auditErr) {
      console.error("[Operator] Failed to write Audit Log:", auditErr);
    }

    return Response.json({
      reply: parsed.reply,
      action: parsed.action,
      params: parsed.params,
      reasoning: parsed.reasoning || [],
      confidence: parsed.confidence || null,
      validated: isValid
    });
  } catch (error) {
    console.error("[Operator] Fatal error:", error);
    return Response.json({ reply: "System critical error. Fallback activated." }, { status: 500 });
  }
}
