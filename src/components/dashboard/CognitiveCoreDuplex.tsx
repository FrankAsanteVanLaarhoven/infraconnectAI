'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Activity, Radio, X, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMemoryStore } from '@/store/memory-store';
import { cn } from '@/lib/utils';

export function CognitiveCoreDuplex({ onClose, autoOpen = true }: { onClose: () => void, autoOpen?: boolean }) {
  const [isListening, setIsListening] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [isMiniature, setIsMiniature] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const addNode = useMemoryStore(s => s.addNode);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let currentInterim = '';
          let finalTranscriptSegment = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscriptSegment += event.results[i][0].transcript;
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }

          if (finalTranscriptSegment) {
            setTranscript(prev => prev + ' ' + finalTranscriptSegment);
          }
          setInterimTranscript(currentInterim);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          toast.error('Microphone error: ' + event.error);
        };

        recognitionRef.current.onend = () => {
          // If it ends but we still want to be listening, restart it
          if (isListening && recognitionRef.current) {
             recognitionRef.current.start();
          } else {
             setIsListening(false);
          }
        };
      } else {
        toast.error('Speech Recognition API not supported in this browser.');
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Only run once on mount

  // Handle pulse animation and listening state
  useEffect(() => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
           // Already started
        }
      }
      const interval = setInterval(() => {
        setPulse(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setPulse(0);
    }
  }, [isListening]);

  const toggleListening = () => {
    if (!isListening) {
      setTranscript('');
      setInterimTranscript('');
      toast.success('Mic open. Speak your directive.');
    } else {
      if (transcript.trim() || interimTranscript.trim()) {
        const finalDirective = (transcript + ' ' + interimTranscript).trim();
        toast('Directive Captured', { description: 'Piping to L0 Execution...' });
        
        // Push to Memory Store as requested
        addNode({
            id: crypto.randomUUID(),
            title: `Voice Directive`,
            content: `Operator transcribed input:\n\n"${finalDirective}"`,
            level: 'L0',
            plane: 'execution',
            category: 'telemetry',
            status: 'scratch',
            parentId: null,
            tags: ['cognitive-core', 'voice-interaction'],
            healthScore: 1.0,
            conflictCount: 0,
            referenceCount: 0,
            lastValidated: null,
            expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
      }
    }
    setIsListening(!isListening);
  };

  return (
    <div className={cn(
      "fixed z-[100] bg-background/95 backdrop-blur-xl flex font-mono overflow-hidden transition-all duration-300 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)]",
      isMiniature 
        ? "bottom-4 left-4 w-96 h-[32rem] rounded-2xl flex-col items-center justify-between py-6"
        : "inset-0 flex-col items-center justify-center"
    )}>
      {/* Background Matrix/Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div 
          className={cn(
            "rounded-full bg-emerald-500/20 blur-[100px] transition-all duration-75",
            isMiniature ? "w-[120%] h-[120%]" : "w-[60vw] h-[60vw]"
          )}
          style={{ transform: `scale(${1 + pulse / 200})` }}
        />
      </div>

      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <button 
          onClick={onClose}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors bg-background/50 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setIsMiniature(!isMiniature)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors bg-background/50 rounded-full"
        >
          {isMiniature ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>
      </div>

      <div className={cn(
        "z-10 flex flex-col items-center w-full px-6",
        isMiniature ? "gap-6 mt-8" : "gap-8 max-w-3xl text-center"
      )}>
        <div className="flex items-center gap-3 text-emerald-500">
          <Radio className="w-6 h-6 animate-pulse" />
          <h1 className={cn("tracking-[0.2em] uppercase font-bold", isMiniature ? "text-sm" : "text-xl")}>
            Cognitive Orchestration
          </h1>
        </div>

        {/* Live Transcript Box */}
        <div className={cn(
          "flex items-center justify-center w-full border border-white/5 bg-black/40 rounded-xl relative overflow-hidden backdrop-blur-sm",
          isMiniature ? "h-32 px-4" : "h-48 px-8 max-w-2xl"
        )}>
          {isListening || transcript || interimTranscript ? (
            <div className="w-full text-center space-y-2 overflow-y-auto">
               {transcript && <span className={cn("text-foreground/80 font-light tracking-wide", isMiniature ? "text-sm" : "text-xl")}>{transcript}</span>}
               {interimTranscript && <span className={cn("text-emerald-400 font-light tracking-wide animate-pulse", isMiniature ? "text-sm" : "text-xl")}> {interimTranscript}</span>}
               {isListening && !transcript && !interimTranscript && (
                  <p className={cn("text-muted-foreground font-light tracking-wide animate-pulse", isMiniature ? "text-sm" : "text-xl")}>
                    Listening...
                  </p>
               )}
            </div>
          ) : (
            <p className={cn("text-muted-foreground/50 font-light tracking-wide text-center", isMiniature ? "text-xs" : "text-xl")}>
              Waiting for microphone initialization...
            </p>
          )}
        </div>

        <button
          onClick={toggleListening}
          className={cn(
            "relative flex items-center justify-center rounded-full border-2 transition-all duration-500",
            isMiniature ? "w-20 h-20" : "w-32 h-32",
            isListening 
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.3)]' 
              : 'bg-foreground/5 border-border/20 text-muted-foreground hover:bg-foreground/10 hover:border-border/40'
          )}
        >
          {isListening ? <Activity className={isMiniature ? "w-8 h-8" : "w-12 h-12"} /> : <Mic className={isMiniature ? "w-8 h-8" : "w-12 h-12"} />}
        </button>

        {!isMiniature && (
          <div className="space-y-4 max-w-md mx-auto text-muted-foreground text-xs uppercase tracking-widest leading-loose">
            <p>
              Engage natural language override logic. Live transcriptions are automatically piped directly to L0 execution strata upon completion.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
