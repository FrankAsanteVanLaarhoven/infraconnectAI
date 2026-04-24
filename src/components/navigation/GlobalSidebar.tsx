"use client";

import { signOut } from "next-auth/react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Cpu,
  MonitorPlay,
  ShieldAlert,
  ServerCog,
  BriefcaseBusiness,
  GraduationCap,
  Banknote,
  Network,
  Activity,
  Bot,
  LogOut
} from "lucide-react";

const navGroups = [
  {
    label: "Control Plane",
    items: [
      { title: "Mission Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Operator HUD", url: "/dashboard/operator", icon: Activity },
      { title: "Digital Twin (Sim)", url: "/simulation", icon: MonitorPlay },
      { title: "VLA Workbench", url: "/vla-workbench", icon: Cpu },
    ]
  },
  {
    label: "Fleet Management",
    items: [
      { title: "Agent Operations", url: "/connect", icon: Bot },
      { title: "Nexus Hub", url: "/nexus", icon: Network },
      { title: "Security Matrix", url: "/security", icon: ShieldAlert },
    ]
  },
  {
    label: "Administration",
    items: [
      { title: "Enterprise Admin", url: "/enterprise-admin", icon: BriefcaseBusiness },
      { title: "Super Admin", url: "/super-admin", icon: ServerCog },
    ]
  },
  {
    label: "Platform Analytics",
    items: [
      { title: "Financials & Pricing", url: "/pricing", icon: Banknote },
      { title: "Intelligence Docs", url: "/docs", icon: GraduationCap },
      { title: "Responsible AI", url: "/responsible-ai", icon: Cpu },
    ]
  }
];

export function GlobalSidebar() {
  const pathname = usePathname();

  // Hide the sidebar on landing page and cinematic presentation pages
  if (pathname === '/' || pathname === '/theatre' || pathname === '/live-demo' || pathname?.startsWith('/docs')) {
      return null;
  }

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r border-white/5 bg-black/40 backdrop-blur-md">
      <SidebarHeader className="pt-6 pb-2 px-4 flex flex-row items-center justify-between border-b border-white/10 mb-2 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:flex-col">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 shrink-0 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-white font-bold truncate group-data-[collapsible=icon]:hidden">
            Sovereign Core
          </span>
        </div>
        <SidebarTrigger className="text-slate-400 hover:text-white" />
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group, gIdx) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1 group-data-[collapsible=icon]:hidden">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                         asChild 
                         isActive={isActive} 
                         tooltip={item.title}
                         className={`hover:bg-white/5 hover:text-white transition-all text-xs font-mono tracking-wide ${isActive ? 'bg-zinc-800/50 text-white border border-zinc-700' : 'text-slate-400'}`}
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
            {gIdx < navGroups.length - 1 && <SidebarSeparator className="mt-4 bg-white/5" />}
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-white/5 p-4 group-data-[collapsible=icon]:p-2">
         <button 
           onClick={() => signOut({ callbackUrl: '/auth/login' })}
           className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-white/5 hover:text-white transition-all text-xs font-mono tracking-wide text-slate-400 group-data-[collapsible=icon]:justify-center"
         >
           <LogOut className="w-4 h-4 shrink-0" />
           <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
         </button>
      </SidebarFooter>
    </Sidebar>
  );
}

export function GlobalSidebarTrigger() {
  // We now embed the SidebarTrigger directly in the GlobalSidebar header.
  return null;
}
