'use client';

import { useState } from 'react';
import { Upload, X, Box } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export function URDFImporterModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [robotName, setRobotName] = useState('');
  const [urdfContent, setUrdfContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      await fetch('/api/urdf/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ robotName, urdfContent })
      });
      onClose();
    } catch (e) {
      console.error(e);
    }
    setIsImporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-black border border-white/5 rounded-sm p-6 font-mono text-slate-300">
        <DialogTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-slate-400 mb-6">
          <Box className="w-4 h-4" />
          Import URDF to Simulation
        </DialogTitle>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-500">Robot Designation</label>
            <input 
              type="text" 
              placeholder="e.g. YAHBOOM-M3-PRO"
              value={robotName}
              onChange={(e) => setRobotName(e.target.value)}
              className="w-full bg-black border border-white/5 p-2 text-xs text-white focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-500">URDF Payload</label>
            <textarea 
              rows={8}
              placeholder="<?xml version='1.0'?><robot name='...'>"
              value={urdfContent}
              onChange={(e) => setUrdfContent(e.target.value)}
              className="w-full bg-black border border-white/5 p-2 text-xs text-white focus:outline-none focus:border-white/20 transition-colors custom-scrollbar resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-white/5 text-slate-400 hover:text-white text-xs uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleImport}
              disabled={isImporting || !robotName || !urdfContent}
              className="px-4 py-2 bg-slate-100 text-black hover:bg-white text-xs uppercase tracking-widest font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isImporting ? 'Syncing...' : 'Sync URDF'} <Upload className="w-3 h-3" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
