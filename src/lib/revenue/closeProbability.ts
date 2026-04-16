/**
 * Calculates the probability (0-100) of closing a specific lead.
 */
export function calculateCloseProbability(lead: {
  score: number;
  status: string;
  intent?: string | null;
  visitedDemo: boolean;
  viewedSecurity: boolean;
  replied: boolean;
}) {
  let probability = lead.score * 0.5; // Base probability is half the lead score

  // 1. Status Multipliers
  const statusWeights: Record<string, number> = {
    'new': 0,
    'qualified': 10,
    'meeting': 25,
    'negotiation': 40,
    'closed': 100
  };
  probability += statusWeights[lead.status] || 0;

  // 2. Behavioral Signals
  if (lead.visitedDemo) probability += 10;
  if (lead.viewedSecurity) probability += 5;
  if (lead.replied) probability += 20;

  // 3. Intent Signal
  if (lead.intent === 'high') probability += 10;

  // Cap at 100
  return Math.min(Math.max(probability, 0), 100);
}
