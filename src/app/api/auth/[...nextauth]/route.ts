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
        
        const username = credentials?.username || "";
        const password = credentials?.password || "";
        const fingerprint = credentials?.fingerprint || "UNKNOWN_LEGACY";

        let userRole = 'user';
        let userId = '';
        let userName = '';
        let isValid = false;

        // 1. Admin Bypass
        if ((username === "admin" || username === "commander") && password === "CORE2026") {
           isValid = true;
           userId = username === "admin" ? "001" : "002";
           userName = username === "admin" ? "Overlord" : "Commander X";
           userRole = username === "admin" ? "superadmin" : "admin";
        } else {
           // 2. Enterprise Lead Access Code Check
           const lead = await db.enterpriseLead.findFirst({
              where: {
                 clientIdentifier: username,
                 accessCode: password,
                 status: 'cleared'
              }
           });

           if (lead) {
              isValid = true;
              userId = lead.id;
              userName = lead.clientName;
              userRole = 'user';
           }
        }

        if (isValid) {
          const clientId = username;

          // Fast-path bypass for Vercel Serverless
          if (process.env.VERCEL || process.env.NODE_ENV === "production") {
             return { id: userId, name: userName, role: userRole };
          }

          try {
            // Sovereign Device Validation logic remains the same
            let sub = await db.intelSubscription.findUnique({ where: { clientId } });
            if (!sub) {
              sub = await db.intelSubscription.create({
                data: { clientId, tier: 'GLOBAL', deviceLimit: 3 }
              });
            }

            const knownDevice = await db.userDevice.findUnique({
              where: { clientId_fingerprint: { clientId, fingerprint } }
            });

            if (!knownDevice) {
              const deviceCount = await db.userDevice.count({ where: { clientId } });
              
              if (deviceCount >= sub.deviceLimit) {
                await db.securityIncident.create({
                  data: {
                    clientId, type: 'DEVICE_LIMIT_REACHED', fingerprint, severity: 'high', userAgent: 'NextAuth::Gatekeeper'
                  }
                });
                throw new Error("DEVICE_LOCK_ACTIVE: Hardware limit exceeded. Please deauthorize an existing signature.");
              }

              await db.userDevice.create({
                data: { clientId, fingerprint, label: `HARDWARE_${deviceCount + 1}`, isAuthorized: true }
              });
            } else {
              await db.userDevice.update({
                where: { id: knownDevice.id }, data: { lastSeen: new Date() }
              });
            }
          } catch (dbError: any) {
            console.error("NEXTAUTH DB FAILURE:", dbError.message);
            if (dbError.message?.includes("DEVICE_LOCK_ACTIVE")) throw dbError;
          }

          return { id: userId, name: userName, role: userRole };
        }

        console.log("NEXTAUTH FAILED MISMATCH");
        return null;
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
