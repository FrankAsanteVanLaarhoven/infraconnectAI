"use client";

import React, { useEffect } from "react";
import MissionPlanner from "@/components/mission/MissionPlanner";
import { publish } from "@/lib/core/bus";
import { computeGap } from "@/lib/learning/calibration";

export default function FoundryPage() {
    
    // Abstract hook triggering mock tracking physics specifically to simulate Investor parameters successfully. 
    useEffect(() => {
        const handleExecutionTrigger = () => {
             // 5 seconds after plan lock, simulate drift telemetry naturally hooking back into memory buffer loop
             setTimeout(() => {
                 publish("system.calibration_run", {
                     sim: { id: "demo", source: "sim", pos: [5,0,5], time: 1040, energy: 98 },
                     real: { id: "demo", source: "real", pos: [4.9,0,5.2], time: 1055, energy: 97.4 },
                     context: "Foundry_Execution_Mission"
                 });
             }, 5000);
        };
        
        // Expose a raw DOM listener catching the button array structurally wrapping bounds.
        window.addEventListener("click", (e) => {
             if ((e.target as HTMLElement).innerText === "LOCK PLAN") {
                  handleExecutionTrigger();
             }
        });
    }, []);

    return (
        <div className="w-screen h-screen flex flex-col bg-[#050607] font-mono overflow-hidden">
            <header className="h-14 bg-[#0B0F12] border-b border-[#1A1F24] flex items-center px-6 justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-6 w-6 bg-[#4CC9F0]"></div>
                    <h1 className="text-white text-sm tracking-[0.2em] uppercase font-bold">InfraConnect <span className="opacity-40">/ Mission Foundry</span></h1>
                </div>
                <div className="text-xs text-[#4CC9F0] border border-[#4CC9F0]/30 px-3 py-1 bg-[#4CC9F0]/10 uppercase tracking-widest">
                    Enterprise Tier Connected
                </div>
            </header>
            
            <main className="flex-1 w-full h-full relative">
                <MissionPlanner />
            </main>
        </div>
    );
}
