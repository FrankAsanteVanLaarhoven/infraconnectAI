import { db as prisma } from "@/lib/db";
import { FleetNodeCard } from "@/components/fleet/FleetNodeCard";
import { AnomalyFeed } from "@/components/fleet/AnomalyFeed";
import { InfraConnectLogo } from "@/components/ui/InfraConnectLogo";
import { StabilityVisualizer } from "@/components/fleet/StabilityVisualizer";

export const dynamic = "force-dynamic";

export default async function FleetPage() {
  let nodes: any[] = [];
  try {
    nodes = await prisma.fleetNode.findMany({
      orderBy: { lastSeen: "desc" },
      include: {
        anomalies: {
          orderBy: { detectedAt: "desc" },
          take: 5,
        },
      },
    });
  } catch (error) {
    console.warn("Database connection unavailable. Using resilient mock data for Demo Mode.");
    // Fallback Mock Data for Trailer Video purposes
    nodes = [
      {
        id: "mock1", robotId: "NEMO-A1", alias: "Fabrication Arm Alpha", status: "online", 
        lastSeen: new Date(), memoryBytes: 4096000, anomalyCount: 0, createdAt: new Date(), updatedAt: new Date(),
        anomalies: []
      },
      {
        id: "mock2", robotId: "NEMO-A2", alias: "Logistics Chassis Beta", status: "degraded", 
        lastSeen: new Date(), memoryBytes: 2148000, anomalyCount: 2, createdAt: new Date(), updatedAt: new Date(),
        anomalies: [{ id: "a1", type: "latency_spike", severity: "medium", message: "Kinematic solve delayed", detectedAt: new Date(), resolved: false, fleetNodeId: "mock2", metadata: null }]
      }
    ];
  }

  const totalMemBytes = nodes.reduce(
    (acc, n) => acc + Number(BigInt(n.memoryBytes)),
    0
  );
  const totalMemGB = (totalMemBytes / 1024 / 1024 / 1024).toFixed(2);
  const online = nodes.filter((n) => n.status === "online").length;
  const degraded = nodes.filter((n) => n.status === "degraded").length;
  const offline = nodes.filter((n) => n.status === "offline").length;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-blue-500/30">
      {/* ── Top bar ── */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-white/6 bg-[#0a0b0c]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center pl-2 gap-2 h-full w-[240px] md:w-[280px] shrink-0 overflow-hidden">
          <InfraConnectLogo variant="flat" size="sm" />
        </div>
      </header>

      <div className="container mx-auto p-8 space-y-12 max-w-6xl">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Fleet Monitor</h1>
          <p className="text-xs text-white/50 tracking-widest uppercase">
            Real-time locomotion stability across all registered robot nodes
          </p>
        </div>

        {/* Cinematic Discovery: Stability Visualizer */}
        <div className="w-full">
           <StabilityVisualizer />
        </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: "Total Nodes", value: nodes.length },
          { label: "Online", value: online, color: "text-emerald-400" },
          { label: "Degraded / Offline", value: `${degraded} / ${offline}`, color: "text-amber-400" },
          { label: "Total Memory", value: `${totalMemGB} GB` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)] rounded-xl p-6 transition-all hover:bg-white/10 cursor-default">
            <p className="text-xs text-white/50 tracking-widest uppercase mb-4">{stat.label}</p>
            <p className={`text-2xl font-medium tracking-tight ${stat.color ? stat.color : "text-white/90"}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Node grid */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-medium text-white tracking-tight">Active Nodes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {nodes.map(node => (
              <FleetNodeCard key={node.id} node={node as any} />
            ))}
          </div>
        </div>
        
        {/* Feed side */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-white tracking-tight">Live Anomaly Feed</h2>
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)] rounded-xl p-6 h-full min-h-[400px]">
             <AnomalyFeed />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
