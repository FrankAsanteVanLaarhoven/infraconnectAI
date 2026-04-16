import { Resend } from 'resend';
import { generateSmartEmail } from './revenue/aiEmail';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export type EmailRoutingType = 'security' | 'founder' | 'support' | 'hello';

export const routeEmail = (type: EmailRoutingType | string): string => {
  switch (type) {
    case 'security':
      return 'security@infraconnect.ai';
    case 'founder':
    case 'executive':
    case 'frank':
      return 'frank@infraconnect.ai';
    case 'support':
    case 'technical':
      return 'support@infraconnect.ai';
    default:
      return 'hello@infraconnect.ai';
  }
};

/**
 * Sends a context-aware smart email to a lead.
 */
export async function sendSmartEmail(lead: {
  email: string;
  company?: string | null;
  role?: string | null;
  intent?: string | null;
  score: number;
  visitedDemo: boolean;
  viewedSecurity: boolean;
  message?: string | null;
}) {
  const content = await generateSmartEmail(lead);

  try {
    const { data, error } = await resend.emails.send({
      from: 'InfraConnect <hello@infraconnect.ai>',
      to: lead.email,
      subject: lead.score > 75 ? 'Accelerating your InfraConnect Deployment' : 'InfraConnect Access Transmission',
      html: `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">${content.replace(/\n/g, '<br />')}</div>`,
    });

    if (error) {
      console.error('[EMAIL_SEND_ERROR]', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('[EMAIL_SEND_EXCEPTION]', err);
    return { success: false, error: err };
  }
}
