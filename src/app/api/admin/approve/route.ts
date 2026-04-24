import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId } = await req.json();
    if (!leadId) return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });

    const lead = await db.enterpriseLead.findUnique({ where: { id: leadId } });
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    if (lead.status === 'cleared') {
      return NextResponse.json({ error: 'Lead already cleared' }, { status: 400 });
    }

    // Generate access code
    const randomHex = () => Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
    const accessCode = `ICAI-${randomHex()}-${randomHex()}`;

    // Update lead
    const updatedLead = await db.enterpriseLead.update({
      where: { id: leadId },
      data: { status: 'cleared', accessCode }
    });

    // Send email
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'InfraConnect Access <notifications@infraconnect.ai>', // Use verified domain
        to: lead.clientIdentifier,
        subject: 'InfraConnect Intelligence - Access Granted',
        html: `
          <div style="font-family: monospace; background-color: #050505; color: #f8fafc; padding: 40px; text-align: center;">
            <h1 style="color: #4ade80;">ACCESS GRANTED</h1>
            <p style="color: #94a3b8; font-size: 14px;">Your deployment/waitlist request has been approved.</p>
            <div style="margin: 30px auto; padding: 20px; background-color: #000; border: 1px solid #333; display: inline-block;">
              <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Your Secure Access Code:</p>
              <h2 style="color: #4ade80; margin: 10px 0 0 0; letter-spacing: 2px;">${accessCode}</h2>
            </div>
            <p style="color: #94a3b8; font-size: 14px;">Log in at: <a href="${process.env.NEXTAUTH_URL || 'https://infraconnect-ai.vercel.app'}/auth/login" style="color: #60a5fa;">The Sovereign Core Portal</a></p>
          </div>
        `
      });
    }

    return NextResponse.json({ success: true, accessCode });
  } catch (err: any) {
    console.error("APPROVAL ERROR:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
