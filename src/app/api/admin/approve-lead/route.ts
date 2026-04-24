import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Resend } from 'resend';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const runtime = 'nodejs'; // Use node runtime for prisma and resend

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

// Helper to generate a secure random 12-char code
function generateAccessCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate Admin (Ensure only superadmin can approve)
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized. Superadmin clearance required.' }, { status: 403 });
    }

    const body = await req.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    // 2. Fetch the Lead
    const lead = await db.enterpriseLead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (lead.status === 'cleared') {
      return NextResponse.json({ error: 'Lead is already cleared' }, { status: 400 });
    }

    // 3. Generate Access Code
    const accessCode = generateAccessCode();

    // 4. Update Database
    await db.enterpriseLead.update({
      where: { id: leadId },
      data: {
        status: 'cleared',
        accessCode: accessCode
      }
    });

    // 5. Send Approval Email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'InfraConnect Access <access@infraconnect.ai>',
          to: lead.clientIdentifier,
          subject: 'InfraConnect Access Granted - Your Clearance Code',
          html: `
            <div style="font-family: monospace; padding: 30px; background: #050505; color: #e2e8f0; border: 1px solid #1e293b;">
              <h2 style="color: #10b981; margin-top: 0; letter-spacing: 0.1em; text-transform: uppercase;">Clearance Granted</h2>
              <p style="color: #94a3b8; font-size: 14px;">Subject: ${lead.clientName}</p>
              
              <div style="margin: 30px 0; padding: 20px; background: #0f172a; border-left: 4px solid #10b981;">
                <p style="margin: 0 0 10px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">Your Login Credentials</p>
                <div style="margin-bottom: 10px;">
                  <span style="color: #64748b; display: inline-block; width: 100px;">Identifier:</span>
                  <strong style="color: #f8fafc;">${lead.clientIdentifier}</strong>
                </div>
                <div>
                  <span style="color: #64748b; display: inline-block; width: 100px;">Passcode:</span>
                  <strong style="color: #10b981; letter-spacing: 0.1em; font-size: 18px;">${accessCode}</strong>
                </div>
              </div>

              <p style="margin-bottom: 30px; line-height: 1.6;">
                You may now access the Sovereign Operator Core.<br/>
                Navigate to your control dashboard: 
                <a href="https://infraconnect.ai/auth/login" style="color: #38bdf8; text-decoration: none;">infraconnect.ai/auth/login</a>
              </p>
              
              <hr style="border: 0; border-top: 1px solid #1e293b; margin: 30px 0;" />
              <p style="color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">
                -- Tactical Node Omega --<br/>
                Automated Clearance Transmission
              </p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error("Email sending failed:", emailErr);
        // We don't fail the API request if the email fails, but we should log it.
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Lead approved and access code sent.',
      accessCode: accessCode // Returning for admin UI convenience
    });
  } catch (error: any) {
    console.error("Approve Lead Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
