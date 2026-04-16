/**
 * Heuristic lead scoring for InfraConnect.
 * Scores leads from 0-100 based on firmographic and intent signals.
 */
export async function scoreLead(data: {
  email: string;
  company?: string;
  message?: string;
}) {
  let score = 0;

  // 1. Email Domain check (Corporate vs Generic)
  const genericDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  const domain = data.email.split('@')[1]?.toLowerCase() || '';
  
  if (genericDomains.includes(domain)) {
    score -= 10;
  } else {
    score += 20; // Enterprise signal
  }

  // 2. Company Name weight
  if (data.company && data.company.trim().length > 1) {
    score += 20;
  }

  // 3. Keyword / Intent analysis
  const message = (data.message || '').toLowerCase();
  
  const highIntentKeywords = ['enterprise', 'vla', 'deployment', 'fleet', 'autonomous', 'security'];
  const midIntentKeywords = ['demo', 'pricing', 'access', 'integration', 'connect'];

  highIntentKeywords.forEach(word => {
    if (message.includes(word)) score += 15;
  });

  midIntentKeywords.forEach(word => {
    if (message.includes(word)) score += 5;
  });

  // Cap score at 100 and floor at 0
  return Math.min(Math.max(score, 0), 100);
}
