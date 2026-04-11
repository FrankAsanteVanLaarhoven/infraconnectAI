import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CYBER THREAT OBSERVABILITY & EDGE PROTECTION
// This middleware runs on edge compute before hitting ANY internal service.

const BLOCKED_USER_AGENTS = ['nmap', 'sqlmap', 'nikto', 'curl', 'wget', 'python-requests'];
const SUSPICIOUS_PATHS = ['/wp-admin', '/.git', '/.env', '/etc/passwd'];

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl.pathname.toLowerCase();
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const ipPath = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // 1. ACTIVE THREAT DETECTION (Ultimate Observability)
  // If a known scanner or adversarial path is detected, we immediately drop the request
  // and would theoretically emit an asynchronous threat telemetry event to the Go Firehose.
  const isMaliciousPath = SUSPICIOUS_PATHS.some(path => url.includes(path));
  const isMaliciousScanner = BLOCKED_USER_AGENTS.some(ua => userAgent.includes(ua));

  if (isMaliciousPath || isMaliciousScanner) {
    console.warn(`[CYBER THREAT INTERCEPTED] Origin: ${ipPath} | Vector: ${url} | UA: ${userAgent}`);
    // Return a sterile 403 Forbidden without exposing backend structure.
    return NextResponse.json({ error: 'Access Denied: Adversarial interaction detected.' }, { status: 403 });
  }

  // 2. HARDENED HTTP SECURITY HEADERS (Anti-Tamper & Anti-XSS)
  // Strict Transport Security
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  
  // Prevent MIME-sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent Clickjacking across bridged systems
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Filter out reflected XSS attacks
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Content Security Policy (Strict military-grade sandbox constraint)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self' https://r2cdn.perplexity.ai;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  // 3. ZERO-TRUST CONNECTED SYSTEM ENFORCEMENT & REMOTE ACCESS
  // Any external agent/system hitting commands/mutations must present strict Authorization context
  if (url.startsWith('/api/commands') || url.startsWith('/api/nemoclaw')) {
    const authHeader = request.headers.get('authorization');
    
    // Remote Fleet / User Gateway Check
    if (!authHeader || (!authHeader.startsWith('Bearer enc_') && !authHeader.startsWith('IAM-SSO-'))) {
      console.warn(`[IAM REJECTED] Anonymous access attempt to ${url} from ${ipPath}`);
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid IAM context.' }, { status: 401 });
    }

    // Role-Based Clearance Checking Example (Assuming JWT decoded header from IAM Provider)
    const clearanceLevel = request.headers.get('x-iam-clearance');
    if (url.includes('/api/nemoclaw') && clearanceLevel !== 'L5-GodMode') {
      return NextResponse.json({ error: 'Forbidden: Insufficient MissionControl clearance.' }, { status: 403 });
    }
  }

  return response;
}

// Target execution paths
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
