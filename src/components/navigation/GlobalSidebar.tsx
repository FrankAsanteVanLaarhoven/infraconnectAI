"use client";

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
  Bot
} from "lucide-react";

const navGroups = [
  {
    label: "Control Plane",
    items: [
      { title: "Mission Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Operator HUD", url: "/dashboard/operator", icon: Activity },
      { title: "Digital Twin (Sim)", url: "/simulation", icon: MonitorPlay },
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

  // Hide the sidebar on cinematic presentation pages if needed
  if (pathname === '/theatre' || pathname === '/live-demo' || pathname?.startsWith('/docs')) {
      return null;
  }

  return (
    <Sidebar variant="inset" className="border-r border-white/5 bg-black/40 backdrop-blur-md">
      <SidebarHeader className="pt-6 pb-2 px-4 flex flex-row items-center gap-3 border-b border-white/10 mb-2">
        <div className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-mono font-bold tracking-widest text-white uppercase">InfraConnect</span>
          <span className="text-[9px] font-mono text-slate-500 tracking-wider">Plexus Protocol</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group, gIdx) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                         asChild 
                         isActive={isActive} 
                         tooltip={item.title}
                         className={`hover:bg-white/5 hover:text-white transition-all text-xs font-mono tracking-wide ${isActive ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400'}`}
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                          <span>{item.title}</span>
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
    </Sidebar>
  );
}
