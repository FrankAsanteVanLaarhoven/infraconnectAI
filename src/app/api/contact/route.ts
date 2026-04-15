import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'edge';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_fallback');

// Simple heuristic classifier
function evaluateLead(email: string, intent: string) {
  const genericDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = email.split('@')[1]?.toLowerCase() || '';
  
  const text = intent.toLowerCase();
  const highValueSignals = ['buy', 'enterprise', 'deploy', 'scale', 'compliance', 'sota'];
  let signalScore = 0;
  
  if (!genericDomains.includes(domain)) signalScore += 2;
  highValueSignals.forEach(signal => {
    if (text.includes(signal)) signalScore += 1;
  });
  
  return signalScore >= 2 ? 'HIGH_VALUE' : 'GENERIC';
}

function extractFirstName(email: string) {
  const localPart = email.split('@')[0];
  // Convert frank.vanlaarhoven to Frank
  const nameParts = localPart.split(/[\.\-\_]/);
  const firstName = nameParts[0];
  if (!firstName) return 'Operator';
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}

export async function POST(req: Request) {
  try {
    const { email, department, intent } = await req.json();

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const aliasMap: Record<string, string> = {
      hello: 'hello@infraconnect.ai',
      security: 'security@infraconnect.ai',
      support: 'support@infraconnect.ai',
      frank: 'frank@infraconnect.ai'
    };

    const targetEmail = aliasMap[department] || aliasMap['hello'];
    const clientName = extractFirstName(email);
    const leadTier = evaluateLead(email, intent);

    if (process.env.RESEND_API_KEY) {
        
        // 1. Send Internal Alert (The "Action Required" Reminder to the Humans)
        const internalSubject = leadTier === 'HIGH_VALUE' 
             ? `🚨 [HOT LEAD] Infrastructure Dispatch - ${clientName}` 
             : `[GENERIC] Incoming Query - ${clientName}`;
             
        const internalPromise = resend.emails.send({
          from: 'onboarding@resend.dev',
          to: targetEmail,
          subject: internalSubject,
          text: `CLIENT AUTHENTICATOR: ${email}\nTIER: ${leadTier}\nROUTING: ${department.toUpperCase()}\n\nINTENT PAYLOAD:\n"${intent}"\n\n---\nSYSTEM REMINDER:\nThis lead requires human evaluation. Please review within the standard SLA cadence.`
        });

        // 2. Client Auto-Responder (The AI-driven Palantir-tier cadenced reply)
        const responderSubject = leadTier === 'HIGH_VALUE'
             ? `Infrastructure Clearance Granted, ${clientName}`
             : `InfraConnect - Transmission Received`;
             
        const responderBody = leadTier === 'HIGH_VALUE'
             ? `Hello ${clientName},\n\nThank you for reaching out.\n\nYour deployment intent has been registered by the InfraConnect autonomy engine. A senior member will get back to you shortly after reviewing your specifications with our qualifying team.\n\nPlease note that the full platform is scheduled to go-live in the 1st week of May 2026.\n\nSecurely,\nFrank Van Laarhoven, Founder\nInfraConnect AI`
             : `Hello ${clientName},\n\nWe have successfully received your transmission.\n\nA senior member will get back to you shortly after reviewing your request with the qualifying team. Please be advised that the full site is ready to go-live in the 1st week of May 2026.\n\nThank you for reaching out.\n\nFrank Van Laarhoven, Founder\nInfraConnect AI`;

        const responderPromise = resend.emails.send({
          from: 'onboarding@resend.dev',
          to: email, // Directly auto-responding to the client
          subject: responderSubject,
          text: responderBody
        });

        // Resolve concurrently!
        const [internalResult, responderResult] = await Promise.all([internalPromise, responderPromise]);

        // If the internal alert bounced (API invalid) we throw a hard 400 so the UI turns Red.
        if (internalResult.error) {
           console.error("[Resend Validation Error]:", internalResult.error);
           return NextResponse.json({ error: internalResult.error.message }, { status: 400 });
        }
        
        // We log if the responder bounced. (It WILL bounce if the user's domain is in Sandbox mode and they try to email a random prospect, so we don't throw an error to the UI for sandbox locks, only for the internal block).
        if (responderResult.error) {
           console.warn("[Sandbox/Responder Blocked]:", responderResult.error.message);
        }

        console.log("[Dual-Channel Dispatch OK]");
        return NextResponse.json({ status: 'secured', routing: targetEmail });
    } else {
        console.log(`[Web Simulator] Internal dispatched to ${targetEmail}. Auto-Responder evaluated as ${leadTier} and fired to ${email}.`);
        return NextResponse.json({ status: 'secured', routing: targetEmail });
    }
  } catch (err) {
    console.error("Resend execution failed", err);
    return NextResponse.json({ error: 'Routing execution failed' }, { status: 500 });
  }
}
