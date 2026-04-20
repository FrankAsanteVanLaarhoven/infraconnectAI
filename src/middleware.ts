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
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        
        // Zero-Trust Architecture: 
        // The ONLY public pathways are the explicit Auth interfaces and NextAuth systems
        if (path.startsWith('/auth') || path.startsWith('/api/auth')) {
          return true;
        }
        
        // EVERYTHING else (especially the root '/' landing page) is completely locked out.
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
    "/((?!_next/static|_next/image|favicon.ico|icons|sdk|audio|trailer-assets|fonts).*)",
  ]
};
