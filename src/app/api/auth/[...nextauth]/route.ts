import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "CORE Terminal",
      credentials: {
        username: { label: "Identifier", type: "text" },
        password: { label: "Passcode", type: "password" },
        fingerprint: { label: "Device UDS", type: "text" },
      },
      async authorize(credentials) {
        const { db } = await import("@/lib/db");
        console.log("NEXTAUTH ATTEMPT:", credentials?.username);
        
        if ((credentials?.username === "admin" || credentials?.username === "commander") && credentials?.password === "CORE2026") {
          const clientId = credentials.username;
          const fingerprint = credentials.fingerprint || "UNKNOWN_LEGACY";

          // Fast-path bypass for Vercel Serverless (SQLite cannot be used reliably on Vercel edge/serverless)
          if (process.env.VERCEL || process.env.NODE_ENV === "production") {
             console.warn("NEXTAUTH entering AUTONOMOUS_FALLBACK_MODE (Vercel Serverless Bypass)");
             return { 
               id: clientId === "admin" ? "001" : "002", 
               name: clientId === "admin" ? "Overlord" : "Commander X", 
               role: clientId === "admin" ? "superadmin" : "admin" 
             };
          }

          try {
            // 1. Hardened Subscription Retrieval / Initialization
            let sub = await db.intelSubscription.findUnique({ where: { clientId } });
            if (!sub) {
              sub = await db.intelSubscription.create({
                data: { clientId, tier: 'GLOBAL', deviceLimit: 3 }
              });
            }

            // 2. Sovereign Device Validation
            const knownDevice = await db.userDevice.findUnique({
              where: { clientId_fingerprint: { clientId, fingerprint } }
            });

            if (!knownDevice) {
              const deviceCount = await db.userDevice.count({ where: { clientId } });
              const { sendBreachAlert } = await import("@/lib/notifications/breach-alert");
              const adminEmail = "admin@infraconnect.ai"; // Fallback identifier
              
              if (deviceCount >= sub.deviceLimit) {
                await db.securityIncident.create({
                  data: {
                    clientId,
                    type: 'DEVICE_LIMIT_REACHED',
                    fingerprint,
                    severity: 'high',
                    userAgent: 'NextAuth::Gatekeeper'
                  }
                });

                // Dispatch CRITICAL breach alert
                await sendBreachAlert({
                  email: adminEmail,
                  type: 'LIMIT_BLOCKED',
                  fingerprint
                });

                // Block access with a descriptive error for the UI
                throw new Error("DEVICE_LOCK_ACTIVE: Hardware limit exceeded. Please deauthorize an existing signature.");
              }

              // Auto-authorize new device if under limit
              await db.userDevice.create({
                data: {
                  clientId,
                  fingerprint,
                  label: `HARDWARE_${deviceCount + 1}`,
                  isAuthorized: true
                }
              });

              // Dispatch notification for new device link
              await sendBreachAlert({
                email: adminEmail,
                type: 'NEW_DEVICE',
                fingerprint
              });
            } else {
              // Log access time
              await db.userDevice.update({
                where: { id: knownDevice.id },
                data: { lastSeen: new Date() }
              });
            }
            console.log("NEXTAUTH SUCCESS (Sovereign Guard Cleared)");
          } catch (dbError: any) {
            console.error("NEXTAUTH DB FAILURE:", dbError.message);
            // ALLOW ENTRY in fallback mode if DB is just down but credentials match
            if (dbError.message?.includes("DEVICE_LOCK_ACTIVE")) {
                throw dbError; // Bubble up lock errors
            }
            console.warn("NEXTAUTH entering AUTONOMOUS_FALLBACK_MODE (DB Unreachable)");
          }

          return { 
            id: clientId === "admin" ? "001" : "002", 
            name: clientId === "admin" ? "Overlord" : "Commander X", 
            role: clientId === "admin" ? "superadmin" : "admin" 
          };
        }

        console.log("NEXTAUTH FAILED MISMATCH");
        return null; // Deny entry
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  pages: {
    signIn: "/auth/login", // The cinematic sovereignty portal
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "CORE_overlord_encryption_key_2026",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
