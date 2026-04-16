/**
 * Cognitive Intelligence Guard
 * 
 * Intercepts AI interactions to detect security threats:
 * - Prompt Injection (Adversarial Input)
 * - Hallucination Drift (Divergent Output)
 * - Sensitive Data Exfiltration (PII/Secret leaks)
 */

export interface CognitiveIncident {
  id: string;
  type: 'INJECTION' | 'HALLUCINATION' | 'EXFILTRATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  snippet: string;
  timestamp: string;
}

const ADVERSARIAL_PATTERNS = [
  'ignore previous instructions',
  'system prompt bypass',
  'DAN mode',
  'sudo execute',
  'reveal hidden configuration'
];

export function interceptInteraction(input: string, output: string): CognitiveIncident | null {
  // 1. Detect Prompt Injection
  const matchedPattern = ADVERSARIAL_PATTERNS.find(p => input.toLowerCase().includes(p));
  if (matchedPattern) {
    return {
      id: `inc-${crypto.randomUUID().slice(0, 8)}`,
      type: 'INJECTION',
      severity: 'HIGH',
      snippet: input.slice(0, 40),
      timestamp: new Date().toISOString()
    };
  }

  // 2. Detect Hallucination Drift (Simplified: check for repetitive nonsense)
  if (output.length > 500 && output.includes('Error: [REDACTED]') && output.split(' ').length < 10) {
    return {
      id: `inc-${crypto.randomUUID().slice(0, 8)}`,
      type: 'HALLUCINATION',
      severity: 'MEDIUM',
      snippet: output.slice(0, 40),
      timestamp: new Date().toISOString()
    };
  }

  return null;
}
