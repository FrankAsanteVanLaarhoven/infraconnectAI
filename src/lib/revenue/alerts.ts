import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

/**
 * Alerts the founder (Frank) about high-value lead activity.
 */
export async function alertFounder(lead: {
  email: string;
  score: number;
  company?: string | null;
  role?: string | null;
  message?: string | null;
  activity: string;
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_dummy') {
    console.log(`[founder_alert_mock] Score: ${lead.score} | Activity: ${lead.activity} | Email: ${lead.email}`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'hello@infraconnect.ai',
      subject: `🚨 [HOT LEAD] Infrastructure Dispatch - ${lead.company || lead.email.split('@')[0]}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">High Intent Movement Detected</h2>
          <p><strong>Lead:</strong> ${lead.email}</p>
          <p><strong>Company:</strong> ${lead.company || 'Unknown'}</p>
          <p><strong>Role:</strong> ${lead.role || 'Unknown'}</p>
          <p><strong>Lead Health Score:</strong> ${lead.score}/100</p>
          <hr />
          <p><strong>Activity:</strong> <span style="color: #dc2626; font-weight: bold;">${lead.activity}</span></p>
          <p><strong>Payload / Use Case:</strong></p>
          <blockquote style="border-left: 4px solid #cbd5e1; padding-left: 12px; color: #475569;">
            ${lead.message || 'No additional details provided.'}
          </blockquote>
          <div style="margin-top: 30px;">
            <a href="https://infraconnect.ai/nexus" 
               style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold;">
               Execute Outreach in Operator
            </a>
          </div>
        </div>
      `
    });
    console.log(`[ALERT_SENT] ${lead.email}`);
  } catch (err) {
    console.error('[ALERT_FAIL]', err);
  }
}

/**
 * Checks if activity warrants an alert based on thresholds.
 */
export async function processLeadActivity(lead: any, activity: string) {
  // Alert if score is very high (>80) OR specific high-intent combo
  // MODIFIED FOR TESTING: Always alert to verify Resend pipeline
  const isHighIntentEvent = true;

  if (isHighIntentEvent) {
    await alertFounder({
      email: lead.email,
      score: lead.score,
      company: lead.company,
      activity: activity
    });
  }
}
