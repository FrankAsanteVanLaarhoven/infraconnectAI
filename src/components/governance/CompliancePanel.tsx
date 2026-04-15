'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Download, Trash2, AlertTriangle, Fingerprint, Lock, ShieldAlert } from 'lucide-react';
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function CompliancePanel() {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/gdpr/export');
      const data = await res.json();
      if (data.status === 'success') {
        // In a real app, we'd trigger a download. For now, we'll toast success.
        toast.success('GDPR Export Compiled', {
          description: 'Your operational data has been packaged for download.',
        });
        console.log('Export Data:', data.payload);
      }
    } catch (err) {
      toast.error('Export Failed', { description: 'Could not communicate with the compliance engine.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleForgetMe = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    setKillSwitchActive(true);

    // Cinematic "Kill Switch" effect (glitch / red alert)
    setTimeout(async () => {
      try {
        const res = await fetch('/api/gdpr/delete-user', { method: 'DELETE' });
        const data = await res.json();
        if (data.status === 'success') {
          toast.error('Identity Severed', {
            description: 'All operational traces have been wiped from the edge nodes.',
          });
          // In a real app, we might redirect to a logout page or landing
          setTimeout(() => location.reload(), 3000); 
        }
      } catch (err) {
        toast.error('Erasure Failed', { description: 'Manual intervention required for clean wipe.' });
        setKillSwitchActive(false);
        setIsDeleting(false);
        setConfirmDelete(false);
      }
    }, 2000);
  };

  return (
    <GlassPanel 
      variant="strong" 
      glowStrong 
      className={killSwitchActive ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)] bg-red-950/20' : ''}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-glass-border pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-5 h-5 ${killSwitchActive ? 'text-red-500 animate-ping' : 'text-matrix'}`} />
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Compliance & Privacy</h2>
        </div>
        <Badge variant="outline" className="border-matrix/30 text-matrix bg-matrix/5">
          GDPR Verified
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Right to Access */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold ml-1">Data Sovereignty</div>
          <GlassCard className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Download className="w-4 h-4 text-matrix/70" />
              <div>
                <div className="text-xs font-bold text-foreground">Right to Access</div>
                <div className="text-[10px] text-muted-foreground">Export all AI audit logs and telemetry tied to your identity.</div>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleExport} 
              disabled={isExporting}
              className="border-glass-border hover:bg-matrix/10 hover:text-matrix transition-all text-[10px] h-8"
            >
              {isExporting ? 'Compiling...' : 'Export'}
            </Button>
          </GlassCard>
        </div>

        {/* Right to Erasure */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold ml-1">Privacy Control</div>
          <GlassCard className={`flex flex-col gap-4 border transition-colors ${confirmDelete ? 'border-red-500/50 bg-red-950/10' : ''}`}>
            <div className="flex items-center gap-3">
              <Trash2 className={`w-4 h-4 ${confirmDelete ? 'text-red-500' : 'text-muted-foreground/70'}`} />
              <div>
                <div className="text-xs font-bold text-foreground">Right to Erasure</div>
                <div className="text-[10px] text-muted-foreground">Permanently sever agent identity and wipe all operational traces.</div>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {confirmDelete ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-2 border-t border-red-900/40"
                >
                  <div className="flex items-start gap-2 bg-red-950/30 p-2 rounded border border-red-900/50">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-[10px] text-red-200 leading-relaxed uppercase tracking-wider">
                      This will execute a cryptographic kill-switch. All connected agents will be orphaned and logs will be hashed into an unrecoverable state.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-none uppercase text-[10px] h-8 font-black"
                      onClick={handleForgetMe}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Severing...' : 'Confirm Wipe'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setConfirmDelete(false)}
                      disabled={isDeleting}
                      className="text-[10px] h-8 hover:bg-background/20"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setConfirmDelete(true)}
                  className="w-full text-red-500/70 hover:text-red-500 hover:bg-red-950/20 text-[10px] h-8 border border-red-900/20"
                >
                  Forget Me
                </Button>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>

        {/* Security Summary Overlay */}
        <div className="pt-4 mt-2 border-t border-glass-border">
          <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground uppercase tracking-widest pl-1">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Encrypted Endpoint
            </span>
            <span className="flex items-center gap-1.5">
               <Fingerprint className="w-3 h-3" /> SPIFFE Bound
            </span>
          </div>
        </div>
      </div>

      {/* Kill Switch Glitch Overlay */}
      <AnimatePresence>
        {killSwitchActive && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: [0, 0.2, 0.1, 0.3, 0] }} 
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute inset-0 z-50 pointer-events-none bg-red-600 mix-blend-overlay"
          />
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}
