/**
 * Generates follow-up content based on lead behavior and score.
 */
export function generateFollowUpContent(lead: {
  score: number;
  visitedDemo: boolean;
  viewedSecurity: boolean;
  status: string;
}) {
  if (lead.score > 80 && lead.status !== 'meeting') {
    return "We can deploy this in your environment this week. Want to schedule a call to finalize the technical specs?";
  }

  if (lead.visitedDemo && !lead.viewedSecurity) {
    return "Glad you saw the demo. Our security architecture is where we really push the envelope—any interest in a deeper dive on our zero-trust protocols?";
  }

  if (lead.status === 'qualified') {
    return "Happy to walk you through how InfraConnect would fit into your specific stack. What's the main bottleneck you're looking to solve?";
  }

  return "Checking in to see if you have any further questions about our May 2026 go-live schedule.";
}
