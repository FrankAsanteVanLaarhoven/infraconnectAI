import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Resend } from 'resend';

export const runtime = 'nodejs'; // Use node runtime for prisma and resend

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, intent = 'Early Access Application' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Generic domains to route to waitlist
    const genericDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    // Safety check just in case email is malformed
    if (!domain) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const isEnterprise = !genericDomains.includes(domain);
    const leadTier = isEnterprise ? 'HIGH_VALUE' : 'GENERIC';
    const clientName = email.split('@')[0];

    // 1. Save to Database
    const lead = await db.enterpriseLead.create({
      data: {
        clientIdentifier: email,
        clientName: clientName,
        routingDesignation: isEnterprise ? 'enterprise-inbound' : 'waitlist-inbound',
        intentPayload: intent,
        leadTier: leadTier,
        status: 'queued'
      }
    });

    // 2. Fire Webhook to CRM / Slack / Discord if configured
    if (process.env.CRM_WEBHOOK_URL) {
      try {
        await fetch(process.env.CRM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: isEnterprise 
              ? `🚀 **High-Intent Enterprise Lead Captured!**\n**Email:** \`${email}\`\n**Domain:** \`${domain}\``
              : `👀 **New Waitlist Signup!**\n**Email:** \`${email}\``
          })
        });
      } catch (webhookErr) {
        console.error("Webhook firing failed", webhookErr);
      }
    }

    // 3. Send automated Welcome/Acknowledgement Email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'InfraConnect Access <access@infraconnect.ai>',
          to: email,
          subject: isEnterprise 
            ? 'InfraConnect Enterprise Access - Initiating Clearance' 
            : 'InfraConnect Early Access - Waitlist Position Secured',
          html: `
            <div style="font-family: monospace; padding: 20px; background: #050505; color: #fff;">
              <h2 style="color: #06b6d4;">InfraConnect Network</h2>
              <p>Subject: ${clientName}, your request has been logged.</p>
              ${isEnterprise 
                ? '<p>We detected an enterprise domain signature. Our Strategic Command team will review your application for priority unblocking within 24 hours.</p>' 
                : '<p>You have successfully signed up for the waiting list and are currently <strong>awaiting approval</strong> to try our platform. We are rolling out access in waves.</p>'}
              <br/>
              <p style="color: #64748b; font-size: 12px;">-- Tactical Node Omega --<br/>Automated Transmission</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error("Email sending failed:", emailErr);
      }
    }

    if (isEnterprise) {
      return NextResponse.json({
        status: 'authorized',
        message: 'Enterprise domain verified. Access requested.',
        priority: 'high_intent',
        leadId: lead.id
      });
    } else {
      return NextResponse.json({
        status: 'waitlisted',
        message: 'Priority access reserved for enterprise domains. You have been added to the waitlist.',
        priority: 'standard',
        leadId: lead.id
      });
    }
  } catch (error: any) {
    console.error("Lead Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
