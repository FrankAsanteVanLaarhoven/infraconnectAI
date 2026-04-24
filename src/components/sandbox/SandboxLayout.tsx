"use client";

import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { WorkspaceExplorer } from "./WorkspaceExplorer";
import { AgentManager } from "./AgentManager";
import { CopilotChat } from "./CopilotChat";
import { CodeEditor } from "./CodeEditor";
import { SandboxTerminal } from "../terminal/SandboxTerminal";

// Custom resize handle for the glowing cyberpunk aesthetic
const CustomResizeHandle = ({ vertical = false }: { vertical?: boolean }) => (
  <PanelResizeHandle className={`relative flex items-center justify-center bg-slate-900/50 hover:bg-emerald-500/20 transition-colors ${vertical ? 'h-2 w-full cursor-row-resize' : 'w-2 h-full cursor-col-resize'}`}>
    <div className={`bg-slate-700/50 rounded-full transition-all ${vertical ? 'w-8 h-[2px]' : 'w-[2px] h-8'}`} />
  </PanelResizeHandle>
);

export function SandboxLayout() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  return (
    <div className="flex-1 w-full relative h-[calc(100vh-180px)]">
      <PanelGroup direction="horizontal" className="h-full w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-800 bg-[#0a0a0a] rounded-md overflow-hidden">
        {/* Left Pane: Workspace & Agents */}
        <Panel defaultSize={15} minSize={10} className="flex flex-col">
          <PanelGroup direction="vertical">
            <Panel defaultSize={60} minSize={20} className="overflow-hidden border-b border-slate-800">
              <WorkspaceExplorer onSelectFile={setSelectedFile} />
            </Panel>
            <CustomResizeHandle vertical />
            <Panel defaultSize={40} minSize={20} className="overflow-hidden">
              <AgentManager />
            </Panel>
          </PanelGroup>
        </Panel>

        <CustomResizeHandle />

        {/* Main Canvas: Code Editor */}
        <Panel defaultSize={40} minSize={20} className="border-l border-r border-slate-800 overflow-hidden relative">
          <CodeEditor selectedFile={selectedFile} />
        </Panel>

        <CustomResizeHandle />

        {/* AI Copilot */}
        <Panel defaultSize={20} minSize={15} className="overflow-hidden relative bg-[#0a0a0a]">
          <CopilotChat />
        </Panel>
        
        <CustomResizeHandle />

        {/* Output Terminal */}
        <Panel defaultSize={25} minSize={15} className="border-l border-slate-800 overflow-hidden relative">
          <SandboxTerminal />
        </Panel>
      </PanelGroup>
    </div>
  );
}
