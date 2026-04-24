"use client";

import { useEffect, useState } from "react";
import { Folder, File, ChevronRight, ChevronDown, DownloadCloud, Loader2 } from "lucide-react";

interface FileNode {
  name: string;
  type: "file" | "directory";
  path: string;
  size?: number;
  children?: FileNode[];
}

interface WorkspaceExplorerProps {
  onSelectFile?: (path: string) => void;
}

const TreeNode = ({ node, level = 0, onSelectFile }: { node: FileNode; level?: number; onSelectFile?: (path: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDir = node.type === "directory";

  return (
    <div>
      <div 
        className={`flex items-center gap-1.5 py-1 px-2 hover:bg-slate-800/50 cursor-pointer text-sm font-mono text-slate-300 transition-colors ${level === 0 ? "font-bold text-slate-200" : ""}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => isDir ? setIsOpen(!isOpen) : onSelectFile?.(node.path)}
      >
        {isDir ? (
          <>
            {isOpen ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
            <Folder className="w-3.5 h-3.5 text-cyan-500" />
          </>
        ) : (
          <>
            <span className="w-3" /> {/* Alignment spacer */}
            <File className="w-3.5 h-3.5 text-slate-500" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>
      
      {isOpen && node.children && (
        <div className="flex flex-col">
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} level={level + 1} onSelectFile={onSelectFile} />
          ))}
        </div>
      )}
    </div>
  );
};

export function WorkspaceExplorer({ onSelectFile }: WorkspaceExplorerProps) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/fs')
      .then(res => res.json())
      .then(data => {
        if (data.tree) setTree(data.tree);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch FS tree:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#050505] border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0a0b0c] border-b border-slate-800 shrink-0">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Workspace</span>
        <button 
          onClick={() => {
            const url = window.prompt("Enter Git Repository URL:");
            if (url) {
              window.dispatchEvent(new CustomEvent('terminal:execute', { detail: `git clone ${url}\r` }));
            }
          }}
          className="flex items-center gap-1.5 px-2 py-1 bg-cyan-900/20 text-cyan-400 border border-cyan-900/50 hover:bg-cyan-900/40 transition-colors rounded-sm text-[9px] uppercase tracking-widest font-bold"
          title="Import or Clone Repository"
        >
          <DownloadCloud className="w-3 h-3" />
          Import
        </button>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : tree.length > 0 ? (
          tree.map((node, i) => <TreeNode key={i} node={node} onSelectFile={onSelectFile} />)
        ) : (
          <div className="text-xs text-slate-500 text-center mt-4 font-mono">No files found.</div>
        )}
      </div>
    </div>
  );
}
