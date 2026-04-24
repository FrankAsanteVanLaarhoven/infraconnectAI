import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import NextAuthProvider from "@/components/providers/NextAuthProvider";

import OperatorPanel from "@/components/operator/OperatorPanel";
import { LocalizationProvider } from "@/components/providers/LocalizationProvider";
import { NeuralHUD } from "@/components/ui/NeuralHUD";
import { GlobalSecurityGuard } from "@/components/ui/GlobalSecurityGuard";
import { GlobalSidebar, GlobalSidebarTrigger } from "@/components/navigation/GlobalSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ProjectTimeline } from "@/components/ui/ProjectTimeline";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "InfraConnect — Enterprise Mission Control",
  description: "The state-of-the-art Memory DevOps and Agent Orchestration Layer. Industrial situational awareness for automated workflows as human-in-the-loop mission control.",
  keywords: ["Memory DevOps", "Agent Orchestration", "Mission Control", "Enterprise AI", "Industrial Situation Awareness"],
  icons: {
    icon: '/brand/logo-symbol.png',
    apple: '/icons/icon-192x192.png',
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) { registration.unregister(); }
                });
              }
            `,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <GlobalSecurityGuard>
            <NextAuthProvider>
              <LocalizationProvider>
                <SidebarProvider>
                   <GlobalSidebar />
                   <SidebarInset className="bg-transparent flex-1 w-full h-full min-h-screen relative">
                      <GlobalSidebarTrigger />
                      {children}
                   </SidebarInset>
                </SidebarProvider>
                <NeuralHUD />
                <ProjectTimeline />
                <OperatorPanel />
                <Toaster />
              </LocalizationProvider>
            </NextAuthProvider>
          </GlobalSecurityGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
