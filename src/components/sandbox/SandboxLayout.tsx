"use client";

import { useState } from "react";
import { WorkspaceExplorer } from "./WorkspaceExplorer";
import { AgentManager } from "./AgentManager";
import { CopilotChat } from "./CopilotChat";
import { CodeEditor } from "./CodeEditor";
import { SandboxTerminal } from "../terminal/SandboxTerminal";

export function SandboxLayout() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  return (
    <div className="flex-1 w-full relative flex gap-4 h-full">
      {/* Left Pane: Workspace & Agents (15%) */}
      <div className="w-[15%] min-w-[200px] h-[calc(100vh-180px)] flex flex-col gap-4">
        <div className="flex-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <WorkspaceExplorer onSelectFile={setSelectedFile} />
        </div>
        <div className="h-[40%] min-h-[200px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <AgentManager />
        </div>
      </div>

      {/* Main Canvas: Code Editor (40%) */}
      <div className="w-[40%] min-w-[400px] h-[calc(100vh-180px)] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <CodeEditor selectedFile={selectedFile} />
      </div>

      {/* AI Copilot (20%) */}
      <div className="w-[20%] min-w-[250px] h-[calc(100vh-180px)] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <CopilotChat />
      </div>
      
      {/* Output Terminal (25%) */}
      <div className="flex-1 h-[calc(100vh-180px)] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <SandboxTerminal />
      </div>
    </div>
  );
}
