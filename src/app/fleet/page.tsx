import { db as prisma } from "@/lib/db";
import { FleetNodeCard } from "@/components/fleet/FleetNodeCard";
import { AnomalyFeed } from "@/components/fleet/AnomalyFeed";
import { InfraConnectLogo } from "@/components/ui/InfraConnectLogo";

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
  const totalAnomalies = nodes.reduce((acc, n) => acc + n.anomalyCount, 0);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-blue-500/30">
      {/* ── Top bar ── */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-white/6 bg-[#0a0b0c]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center pl-2 gap-2 h-full w-[240px] md:w-[280px] shrink-0 overflow-hidden">
          <InfraConnectLogo variant="flat" size="sm" />
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6 max-w-6xl mt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">Fleet Monitor</h1>
          <p className="text-sm text-slate-400 font-mono tracking-widest mt-1">
            Real-time memory health across all registered robot nodes
          </p>
        </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Nodes", value: nodes.length },
          { label: "Online", value: online, color: "text-emerald-500" },
          { label: "Degraded / Offline", value: `${degraded} / ${offline}`, color: "text-amber-500" },
          { label: "Total Memory", value: `${totalMemGB} GB` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color ?? ""}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Active Nodes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nodes.map(node => (
              <FleetNodeCard key={node.id} node={node as any} />
            ))}
          </div>
        </div>
        
        {/* Feed side */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Live Anomaly Feed</h2>
          <AnomalyFeed />
        </div>
      </div>
    </div>
    </div>
  );
}
