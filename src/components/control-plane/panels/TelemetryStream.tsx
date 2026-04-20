import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type LogMessage = {
  id: string;
  timestamp: string;
  msg: string;
  type: 'info' | 'warning' | 'error' | 'success';
};

export const TelemetryStream: React.FC<{ logs: LogMessage[] }> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-[#0B0F12] border-l border-[#1A1F24] overflow-hidden">
      <div className="px-4 py-2 border-b border-[#1A1F24] text-[10px] uppercase font-black text-gray-400 tracking-widest">
        📡 TELEMETRY STREAM
      </div>
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        <AnimatePresence>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`text-[10px] font-mono leading-tight px-2 py-1 border-l-2 ${
                log.type === 'error' ? 'border-[#EF4444] text-[#EF4444]' :
                log.type === 'warning' ? 'border-[#F59E0B] text-[#F59E0B]' :
                log.type === 'success' ? 'border-[#22C55E] text-[#22C55E]' :
                'border-[#4CC9F0] text-[#4CC9F0]'
              }`}
            >
              <div className="opacity-50 text-[8px] mb-0.5">{log.timestamp}</div>
              <div>{log.msg}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
