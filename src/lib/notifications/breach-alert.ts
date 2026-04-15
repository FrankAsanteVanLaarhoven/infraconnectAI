import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sovereign Breach Notification Pipeline
 * Dispatches high-fidelity security alerts via Resend for Phase 18.
 */

export async function sendBreachAlert(params: {
  email: string;
  type: 'NEW_DEVICE' | 'LIMIT_BLOCKED';
  fingerprint: string;
  ip?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
     console.warn("Resend API Key missing. Skipping alert dispatch.");
     return;
  }

  const { email, type, fingerprint, ip } = params;
  const isBlocked = type === 'LIMIT_BLOCKED';
  
  const subject = isBlocked 
    ? "⚠️ CRITICAL: Identity Breach Blocked // INFRA-SIGHT OS"
    : "🔔 SECURITY: New Hardware Signature Linked // INFRA-SIGHT OS";

  try {
    await resend.emails.send({
      from: 'Sovereign Guard <security@alerts.infraconnect.ai>', // Replace with verified domain if available
      to: email,
      subject: subject,
      html: `
        <div style="background: #000; color: #fff; padding: 40px; font-family: sans-serif; border: 2px solid ${isBlocked ? '#900' : '#040'}; border-radius: 8px;">
          <h1 style="color: ${isBlocked ? '#f44' : '#4f4'}; text-transform: uppercase; margin-bottom: 20px; font-size: 24px;">Security Matrix Alert</h1>
          <p style="color: #ccc; font-size: 16px; margin-bottom: 30px;">
            ${isBlocked 
              ? 'ALERT: An unauthorized device signature attempted to access your high-fidelity intelligence console.' 
              : 'Notification: A new hardware signature has been successfully linked to your operative profile.'}
          </p>
          
          <div style="background: #111; padding: 20px; border-radius: 4px; border: 1px solid #333;">
            <p style="margin: 5px 0;"><span style="color: #666;">SIGNATURE:</span> <code style="color: #fff;">${fingerprint}</code></p>
            <p style="margin: 5px 0;"><span style="color: #666;">SOURCE IP:</span> <code style="color: #fff;">${ip || 'PROTECTED'}</code></p>
            <p style="margin: 5px 0;"><span style="color: #666;">PROTOCOL:</span> <b style="color: ${isBlocked ? '#f44' : '#4f4'};">${isBlocked ? 'ENFORCEMENT_LOCK' : 'UDS_MAPPING_SUCCESS'}</b></p>
          </div>

          <p style="font-size: 12px; color: #555; margin-top: 40px;">
            This is an automated tactical response from INFRA-SIGHT Sovereign Guard. 
            If you did not authorize this signature, initiate an emergency credential flush immediately.
          </p>
        </div>
      `
    });
    console.log(`Security alert [${type}] dispatched to ${email}`);
  } catch (error) {
    console.error("Resend Dispatch Error:", error);
  }
}
