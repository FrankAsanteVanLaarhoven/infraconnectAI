/**
 * Tactical Negotiation Engine
 * 
 * Provides surgically precise rebuttals to enterprise objections,
 * grounded in the lead's ROI manifest and behavioral history.
 */

import { ROIMetrics, getROISummary } from "./roiEngine";
import { db } from "@/lib/db";

export type ObjectionType = 'COST' | 'SECURITY' | 'VELOCITY' | 'INTEGRATION' | 'GENERAL';

export interface RebuttalResponse {
  rebuttal: string;
  tactic: string;
  deltaScore: number;
}

const REBUTTAL_FRAMEWORKS: Record<ObjectionType, string> = {
  COST: "Focus on the 'Cost of Inaction' (COI). Pivot the conversation from Price to Magnitude of Efficiency.",
  SECURITY: "Leverage the Security Portal validation. Emphasize sovereign sharding and air-gapped support options.",
  VELOCITY: "Highlight the 'Instant Connection' architecture. Contrast with the 6-month typical enterprise integration delay.",
  INTEGRATION: "Emphasize 'Zero API' connectivity. The lead's ecosystem remains untouched while the intelligence layer sits on top.",
  GENERAL: "Reiterate the Strategic Thesis and total ecosystem value."
};

export function generateTacticalSuggestion(type: ObjectionType, roi: ROIMetrics): RebuttalResponse {
  let rebuttal = "";
  let tactic = REBUTTAL_FRAMEWORKS[type];
  let deltaScore = 0;

  switch (type) {
    case 'COST':
      rebuttal = `InfraConnect isn't a cost center; it's a £${(roi.totalAnnualImpact / 1000).toFixed(0)}k/year profit center. The 'Payback Period' is only ${roi.paybackMonths.toFixed(1)} months. Delaying by one quarter costs you £${(roi.totalAnnualImpact / 4).toFixed(0)}k.`;
      deltaScore = 5;
      break;
    case 'SECURITY':
      rebuttal = "Our sharding architecture ensures no data leaves your sovereign environment. You aren't just buying connectivity; you're buying the most secure agentic substrate on the market.";
      deltaScore = 3;
      break;
    case 'VELOCITY':
      rebuttal = "Legacy competitors take 4-6 months to provision. We provision in 48 hours. By the time they finish their initial scoping, you will have already captured £${(roi.totalAnnualImpact / 2).toFixed(0)}k in velocity gains.";
      deltaScore = 4;
      break;
    default:
      rebuttal = "InfraConnect provides a unique strategic advantage by unifying your fragmented data silos without a rebuild.";
      deltaScore = 2;
  }

  return { rebuttal, tactic, deltaScore };
}

export async function logDealActivity(leadId: string, type: string, description: string) {
  try {
    await db.dealActivity.create({
      data: {
        leadId,
        type,
        description,
      }
    });
  } catch (err) {
    console.error("LOG_ACTIVITY_FAIL", err);
  }
}
