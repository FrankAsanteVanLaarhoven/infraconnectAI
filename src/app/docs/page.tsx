"use client";

import React, { useState } from 'react';
import { DocumentationManifest } from '@/lib/docs/manifest';
import { BookOpen, ChevronRight, TerminalSquare, Search, Zap, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown'; // Assuming the user can install or we will just render standard markdown manually if it fails, but we'll try a raw JSX simulation first.

// A raw renderer substituting react-markdown to avoid dependency issues while maintaining SOTA style
const parseMarkdownToJSX = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('# ')) {
      return <h1 key={idx} className="text-3xl font-black text-white tracking-widest uppercase mb-6 mt-8 flex items-center gap-3"><TerminalSquare className="text-cyan-500 w-6 h-6" />{line.replace('# ', '')}</h1>;
    }
    if (line.startsWith('### ')) {
      return <h3 key={idx} className="text-sm font-black text-cyan-400 tracking-widest uppercase mb-4 mt-8 border-b border-cyan-900/30 pb-2">{line.replace('### ', '')}</h3>;
    }
    if (line.startsWith('> **Caution**')) {
      return (
         <div key={idx} className="bg-red-950/20 border border-red-500/30 p-4 rounded-lg my-6 flex gap-3 text-red-200">
             <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
             <p className="text-sm font-mono">{line.replace('> **Caution**: ', '')}</p>
         </div>
      );
    }
    if (line.startsWith('- **')) {
       // Match bold bullet points
       const parts = line.split('**:');
       const boldPart = parts[0].replace('- **', '');
       const trailingPart = parts.slice(1).join('**:');
       return (
          <li key={idx} className="text-slate-300 font-mono text-xs mb-3 flex items-start gap-2">
             <Zap className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
             <span><strong className="text-white bg-white/10 px-1 rounded mr-2">{boldPart}</strong> {trailingPart}</span>
          </li>
       );
    }
    if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
       return <div key={idx} className="text-slate-400 font-mono text-sm mb-3 pl-4 border-l-2 border-indigo-500/30">{line}</div>;
    }
    if (line.trim() === '') return <br key={idx} />;

    return <p key={idx} className="text-slate-400 font-mono text-sm leading-relaxed mb-4">{line}</p>;
  });
};

export default function AppDocsPage() {
  const [activeId, setActiveId] = useState(DocumentationManifest[0].sections[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const activeContent = DocumentationManifest
    .flatMap(c => c.sections)
    .find(s => s.id === activeId);

  return (
    <div className="flex h-full w-full bg-[#050607] text-white overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Docs Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-md flex flex-col h-full z-10 relative">
         <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                   <BookOpen className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                   <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-white">Intelligence</h2>
                   <p className="text-[9px] text-cyan-500 font-mono tracking-widest">KNOWLEDGE BASE v2.4</p>
                </div>
            </div>

            {/* Simulated Search */}
            <div className="relative">
                <Search className="w-3 h-3 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Query limits, topologies..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500/50 text-white placeholder:text-slate-600 transition-colors"
                />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {DocumentationManifest.map((category) => (
                <div key={category.id}>
                   <h4 className="text-[9px] font-black tracking-widest text-slate-500 uppercase mb-3 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-slate-700" />
                      {category.category}
                   </h4>
                   <ul className="space-y-1">
                      {category.sections.map((section) => {
                         const isActive = activeId === section.id;
                         return (
                           <li key={section.id}>
                              <button 
                                onClick={() => setActiveId(section.id)}
                                className={cn(
                                   "w-full text-left px-3 py-2 rounded-lg font-mono text-[11px] transition-all flex justify-between items-center",
                                   isActive 
                                     ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                                     : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                                )}
                              >
                                {section.title}
                                {isActive && <ChevronRight className="w-3 h-3 text-cyan-500" />}
                              </button>
                           </li>
                         );
                      })}
                   </ul>
                </div>
            ))}
         </div>
         
         <div className="p-4 border-t border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between text-[9px] font-mono tracking-widest uppercase">
               <span className="text-slate-500">System State</span>
               <span className="text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> INDEXED</span>
            </div>
         </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar relative z-10 scroll-smooth">
         <div className="max-w-4xl mx-auto px-12 py-16">
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-8">
                <span>Intelligence Base</span>
                <span>/</span>
                <span className="text-cyan-500">{DocumentationManifest.find(c => c.sections.some(s => s.id === activeId))?.category}</span>
                <span>/</span>
                <span className="text-white">{activeContent?.title}</span>
            </div>

            <div className="glass-panel p-10 rounded-2xl bg-black/20 border border-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
               {/* Accent line */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
               
               {activeContent ? (
                  <div className="prose prose-invert prose-slate max-w-none">
                     {parseMarkdownToJSX(activeContent.content)}
                  </div>
               ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-500 font-mono">
                     <BookOpen className="w-12 h-12 mb-4 opacity-50" />
                     <p>Select a matrix vector to expand.</p>
                  </div>
               )}
            </div>

            {/* Footer Navigation simulation */}
            <div className="mt-12 flex justify-between items-center border-t border-white/5 pt-6 text-xs font-mono uppercase tracking-wider">
               <button className="text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 rotate-180" /> Previous Vector
               </button>
               <button className="text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-2">
                  Next Vector <ChevronRight className="w-4 h-4" />
               </button>
            </div>
         </div>
      </main>

      {/* Global generic custom scrollbar styles for this route specifically (so it doesn't leak unless desired) */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.4);
        }
      `}} />
    </div>
  );
}
