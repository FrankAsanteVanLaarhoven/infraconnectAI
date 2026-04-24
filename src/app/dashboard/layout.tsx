"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // Direct redirect via Next.js router to avoid bfcache showing ghost pages
      window.location.href = '/auth/login';
    },
  });

  const router = useRouter();

  useEffect(() => {
    // Ensure back-button restores hit the session check
    const handlePageshow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Force refresh if loaded from bfcache to trigger session re-validation
        window.location.reload();
      }
    };

    window.addEventListener("pageshow", handlePageshow);

    // If NextAuth updates state to unauthenticated mid-flight
    if (status === "unauthenticated") {
      window.location.replace("/auth/login");
    }

    return () => window.removeEventListener("pageshow", handlePageshow);
  }, [status]);

  if (status === "loading") {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center font-mono text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
        <span className="text-xs uppercase tracking-widest animate-pulse">Verifying Access Token...</span>
      </div>
    );
  }

  return <>{children}</>;
}
