import React, { useState, useEffect } from 'react';
import { Terminal, Play } from 'lucide-react';
import { runDemo } from '@/lib/demo/engine';

export const Omnibar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
      
      if (e.key === 'Enter' && input.toLowerCase() === '> demo') {
         runDemo();
         setInput("");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, input]);

  return (
    <div className="flex items-center gap-4 w-full h-12 bg-[#0B0F12] border-b border-[#1A1F24] px-4 shadow-sm z-50">
      <div className="flex items-center gap-2 text-[#4CC9F0]">
        <Terminal size={14} />
        <span className="text-[10px] uppercase font-black tracking-widest">NEXUS_OMNIBAR</span>
      </div>
      <div className="flex-1 px-4">
        <div className={`relative flex items-center w-full max-w-lg transition-all ${open ? 'ring-1 ring-[#4CC9F0]' : 'opacity-70'}`}>
          <div className="absolute left-3 text-[#4CC9F0] opacity-50">&gt;</div>
          <input 
            type="text" 
            placeholder="Cmd+K to order mission..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-[#050607] border border-[#1A1F24] rounded-md h-8 pl-8 pr-4 text-[11px] text-white focus:outline-none placeholder:text-gray-600"
          />
        </div>
      </div>
      <div className="flex gap-4 text-[9px] uppercase tracking-widest text-gray-500 font-black">
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#22C55E] rounded-sm blur-[1px]"></div> K3S EDGE: ONLINE</span>
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#4CC9F0] rounded-sm"></div> ROBOT: URDF-1</span>
      </div>
      
      {/* Enterprise Demo Override Hook */}
      <button 
        onClick={runDemo}
        className="ml-4 px-4 py-1.5 bg-[#4CC9F0] hover:bg-[#4CC9F0]/80 text-[#0B0F12] font-black text-[10px] uppercase tracking-widest rounded flex items-center gap-2 transition-all"
      >
        <Play size={10} className="fill-[#0B0F12]" />
        Run Demo
      </button>
    </div>
  );
};
