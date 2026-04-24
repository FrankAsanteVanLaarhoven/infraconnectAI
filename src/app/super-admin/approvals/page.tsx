"use client";

import { useEffect, useState } from "react";
import { PremiumBackButton } from "@/components/navigation/PremiumBackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Mail, ServerCog, User, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Lead {
  id: string;
  clientIdentifier: string;
  clientName: string;
  leadTier: string;
  status: string;
  intentPayload: string;
  capturedAt: string;
}

export default function ApprovalsPage() {
  const { data: session, status } = useSession({ required: true });
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session.role !== "admin" && session.role !== "superadmin") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      // In a real app we'd fetch this from a protected API, but we can just use a server action or API route.
      // For now, let's create a quick API route or assume it exists. Wait, I should create `GET /api/admin/leads`.
      const res = await fetch("/api/admin/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leadId: string) => {
    setApproving(leadId);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      if (res.ok) {
        // Remove from list or mark as cleared
        setLeads(leads.filter((l) => l.id !== leadId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApproving(null);
    }
  };

  if (loading || status === "loading") {
    return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-mono">LOADING...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans p-8">
      <PremiumBackButton href="/dashboard" />
      
      <div className="max-w-6xl mx-auto mt-12">
        <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-6">
          <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
            <ServerCog className="w-6 h-6 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Access Control & Approvals</h1>
            <p className="text-sm text-zinc-500 font-mono mt-1">Review waitlist and deployment requests.</p>
          </div>
        </div>

        <div className="space-y-4">
          {leads.length === 0 ? (
            <div className="p-12 border border-zinc-800 border-dashed rounded-lg text-center bg-zinc-900/20">
              <p className="text-zinc-500 font-mono">No pending requests.</p>
            </div>
          ) : (
            leads.map((lead) => (
              <div key={lead.id} className="p-6 border border-zinc-800 bg-zinc-950 rounded-lg flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-zinc-500" />
                      {lead.clientName}
                    </h3>
                    {lead.leadTier === 'HIGH_VALUE' ? (
                      <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20">HIGH VALUE</Badge>
                    ) : (
                      <Badge className="bg-zinc-800 text-zinc-400 border border-zinc-700">GENERIC</Badge>
                    )}
                    <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(lead.capturedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-zinc-400 font-mono">
                    <Mail className="w-4 h-4" /> {lead.clientIdentifier}
                  </div>
                  
                  <div className="text-sm bg-black border border-zinc-800 p-3 rounded text-zinc-400">
                    "{lead.intentPayload}"
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-4">
                  <Button 
                    onClick={() => handleApprove(lead.id)}
                    disabled={approving === lead.id}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest uppercase text-xs"
                  >
                    {approving === lead.id ? 'TRANSMITTING...' : 'APPROVE & DISPATCH KEY'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
