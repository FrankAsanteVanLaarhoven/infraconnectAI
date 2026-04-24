"use client";

import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Play, Save, FileCode2, Loader2 } from "lucide-react";

interface CodeEditorProps {
  selectedFile: string | null;
}

export function CodeEditor({ selectedFile }: CodeEditorProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState("typescript");

  useEffect(() => {
    if (!selectedFile) {
      setContent("// Select a file from the Workspace Explorer to start editing.\n// Replit-Mode: Active.");
      return;
    }

    // Determine language based on extension
    if (selectedFile.endsWith('.py')) setLanguage("python");
    else if (selectedFile.endsWith('.json')) setLanguage("json");
    else if (selectedFile.endsWith('.md')) setLanguage("markdown");
    else if (selectedFile.endsWith('.ipynb')) setLanguage("json"); // Notebooks parsed as JSON for now
    else setLanguage("typescript");

    setLoading(true);
    fetch(`/api/fs/read?path=${encodeURIComponent(selectedFile)}`)
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          setContent(data.content);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedFile]);

  const handleSave = async () => {
    if (!selectedFile) return;
    setSaving(true);
    try {
      await fetch('/api/fs/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: selectedFile, content })
      });
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    if (!selectedFile) return;
    
    // Save first before running
    await handleSave();

    let command = "";
    
    if (selectedFile.endsWith('.ipynb')) {
      // Jupyter Notebook compilation logic
      // We parse the JSON, extract code cells, build a temp file, and execute it
      try {
        const notebook = JSON.parse(content);
        const codeCells = notebook.cells
          .filter((cell: any) => cell.cell_type === 'code')
          .map((cell: any) => cell.source.join(''))
          .join('\n\n');
          
        const tempPath = selectedFile.replace('.ipynb', '.temp_run.py');
        
        await fetch('/api/fs/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: tempPath, content: codeCells })
        });
        
        command = `python3 ${tempPath}\r`;
      } catch (err) {
        console.error("Failed to parse notebook", err);
        alert("Invalid Notebook JSON");
        return;
      }
    } else if (selectedFile.endsWith('.py')) {
      command = `python3 ${selectedFile}\r`;
    } else if (selectedFile.endsWith('.ts') || selectedFile.endsWith('.js')) {
      command = `bun run ${selectedFile}\r`;
    } else {
      alert("Execution not supported for this file type yet.");
      return;
    }

    // Dispatch event to SandboxTerminal to execute the command natively
    window.dispatchEvent(new CustomEvent('terminal:execute', { detail: command }));
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border border-slate-800 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-[#333333] shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileCode2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-[11px] font-mono tracking-wide text-slate-300 truncate">
            {selectedFile ? selectedFile.split('/').pop() : 'No file selected'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave}
            disabled={!selectedFile || saving}
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors rounded-sm text-[10px] uppercase font-bold disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save
          </button>
          <button 
            onClick={handleRun}
            disabled={!selectedFile}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white transition-colors rounded-sm text-[10px] uppercase tracking-widest font-bold disabled:opacity-50"
          >
            <Play className="w-3 h-3" />
            Run
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] z-10">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          </div>
        ) : null}
        
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={content}
          onChange={(val) => setContent(val || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "var(--font-mono)",
            padding: { top: 16 },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}
