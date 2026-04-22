import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Security signatures
const SCRAPER_SIGNATURES = [
  'python', 'curl', 'wget', 'headless', 'puppeteer', 'scrapy', 'bot', 'spider', 'crawler',
  'insomnia', 'postman', 'httpie', 'urllib', 'nmap', 'zmap', 'masscan', 'nikto'
];

export default withAuth(
  function middleware(req) {
    const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
    
    // WAF Layer 1: Deny known automation toolchains
    if (SCRAPER_SIGNATURES.some(sig => userAgent.includes(sig))) {
      return new NextResponse(null, { 
        status: 403, 
        statusText: "Forbidden: Autonomous scraper terminated" 
      });
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET || "sota_overlord_encryption_key_2026",
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        
        // Public pathways: Auth interfaces and the root landing page (waitlist)
        if (path === '/' || path.startsWith('/api/access') || path.startsWith('/auth') || path.startsWith('/api/auth')) {
          return true;
        }
        
        // EVERYTHING else is completely locked out.
        return !!token;
      }
    },
    pages: {
      signIn: "/auth/command", 
    }
  }
);

export const config = {
  // Enforce middleware across all endpoints, skipping static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|sdk|audio|trailer-assets|fonts|api/access).*)",
  ]
};
