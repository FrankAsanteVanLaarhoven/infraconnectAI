"use client";

// HUD Synchronization Pulse: 2026-04-14T03:45:00Z
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Rnd } from 'react-rnd';
import { Activity, ShieldAlert, ShieldCheck, Zap, Terminal as TermIcon, Brain, Globe, Database, Network, Mic, MicOff, Maximize2, Settings2, Plane, Satellite, Map as MapIcon, CloudRain, Video, Bell, Target, ListFilter, Monitor } from 'lucide-react';
import { MatrixRain } from '@/components/ui/matrix-rain';
import { IntelligenceGlobe } from '@/components/ui/intelligence-globe';
import { useSfx } from '@/hooks/useSfx';
import { IntelligenceVaultGuard } from '@/components/ui/intelligence-vault-guard';
import { MetricLensChart } from '@/components/nexus/MetricLensChart';
import { VesselDetailHub } from '@/components/nexus/VesselDetailHub';
import { RiskMatrix } from '@/components/nexus/RiskMatrix';
import { getGroupedWidgets, ToolsetWidget } from '@/lib/nexus/predictive';
import { TacticalSettingsBar } from '@/components/nexus/TacticalSettingsBar';
import { TimelineController } from '@/components/nexus/TimelineController';
import { LayerRegistryGrid } from '@/components/nexus/LayerRegistryGrid';
import { GroundTruthCard } from '@/components/nexus/GroundTruthCard';
import { SecurityPostureGuard } from '@/components/nexus/SecurityPostureGuard';
import { LegalIntelligenceHub } from '@/components/nexus/LegalIntelligenceHub';
import { EconomicThreatRadar } from '@/components/nexus/EconomicThreatRadar';
import { MaritimeIntelligenceHub } from '@/components/nexus/MaritimeIntelligenceHub';
import { EnergySectorLens } from '@/components/nexus/EnergySectorLens';
import { SwarmOrchestrator } from '@/components/nexus/SwarmOrchestrator';
import { StrategicReportView } from '@/components/nexus/StrategicReportView';
import { DealPipelineHub } from '@/components/nexus/DealPipelineHub';
import { AdaptiveSwarmEngine } from '@/components/nexus/AdaptiveSwarmEngine';
import { MetaOrchestrator } from '@/components/nexus/MetaOrchestrator';
import { ValidationReport } from '@/components/nexus/ValidationReport';
import { InfraConnectLogo } from '@/components/ui/InfraConnectLogo';
import { fetchIntelligenceFeeds, IntelligenceFeedItem, KNOWLEDGE_BASE } from '@/lib/nexus/intelligence';
import { NexusWindowPrimitive } from '@/components/nexus/NexusWindowPrimitive';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { NeuralHandshake } from '@/components/ui/NeuralHandshake';
import { useRouter } from 'next/navigation';

import { EnvironmentAwareness } from '@/components/nexus/EnvironmentAwareness';
import { SovereignDevHub } from '@/components/core/SovereignDevHub';

// SOTA ADDITIONS: Generative & Capture Logic
import { PersonaplexBar } from "@/components/nexus/PersonaplexBar";
import { RecordingController } from "@/components/nexus/RecordingController";
import { CameraPresenter } from "@/components/nexus/CameraPresenter";
import { SimController } from '@/components/nexus/SimController';
import { MedallionRefinery } from '@/components/nexus/MedallionRefinery';
import { LineageGraph } from '@/components/nexus/LineageGraph';
import { ObjectExplorer } from '@/components/nexus/ObjectExplorer';
import { MultiverseSim } from '@/components/nexus/MultiverseSim';
import { ResonanceAuthorize } from '@/components/nexus/ResonanceAuthorize';
import { GeospatialHub } from '@/components/nexus/GeospatialHub';
import { SovereignSwarmManager } from '@/components/nexus/SovereignSwarmManager';
import { ConcurrentMissionNexus } from '@/components/nexus/ConcurrentMissionNexus';
import { StrategicRehearsalNexus } from '@/components/nexus/StrategicRehearsalNexus';
import { MissionBriefing } from '@/components/nexus/MissionBriefing';
import { AssetIntelligenceHub } from '@/components/nexus/AssetIntelligenceHub';
import { CivilizationalPulseLens } from '@/components/nexus/CivilizationalPulseLens';
import { FinancialStackMatrix } from '@/components/nexus/FinancialStackMatrix';
import { GlobalRealEstateRegistry } from '@/components/nexus/GlobalRealEstateRegistry';
import { InsiderIntelligenceHub } from '@/components/nexus/InsiderIntelligenceHub';
import { SignalIntelligenceLens } from '@/components/nexus/SignalIntelligenceLens';
import { CapitalFlowMatrix } from '@/components/nexus/CapitalFlowMatrix';
import { DecisionMakerPulse } from '@/components/nexus/DecisionMakerPulse';
import { DigitalMoneyMatrix } from '@/components/nexus/DigitalMoneyMatrix';
import { TerafabComputeLens } from '@/components/nexus/TerafabComputeLens';
import { SovereignBankMonitor } from '@/components/nexus/SovereignBankMonitor';
import { SARDiscoveryEngine } from '@/components/nexus/SARDiscoveryEngine';
import { QuantResearchTrader } from '@/components/nexus/QuantResearchTrader';
import { SovereignIdentity } from '@/components/nexus/SovereignIdentity';
import { VisualBacktestHub } from '@/components/nexus/VisualBacktestHub';
import { NexusScalper } from '@/components/nexus/NexusScalper';
import { Users, User, DollarSign, Cpu, Landmark, TrendingUp, History, CreditCard, Home, GitBranch, Droplets, Share2, Binary, Waves, Box, Layers } from 'lucide-react';
import { useTranslation } from '@/components/providers/LocalizationProvider';
import { TacticalUtilitySuite } from '@/components/nexus/TacticalUtilitySuite';

const STORAGE_KEY = 'infraconnect_nexus_v1_layout';



const PANEL_KEYS: Record<string, string> = {
  '1': 'settings',
  '2': 'timeline',
  '3': 'groundTruth1',
  '4': 'groundTruth2',
  '5': 'vfx',
  '6': 'layers',
  '7': 'intercepts',
  '8': 'aiBridge',
  '9': 'tasking',
  '0': 'syndication',
  '-': 'security',
  '=': 'awareness',
  'p': 'pulse',
  's': 'stack',
  'h': 'housing',
  'u': 'insider',
  'i': 'identity',
  'j': 'sigint',
  'k': 'capital',
  'd': 'decision',
  'm': 'money',
  't': 'terafab',
  'g': 'government',
  'r': 'refinery',
  'f': 'rehearsal',
  'b': 'briefing',
  'e': 'energy',
  'a': 'acquisition',
  'v': 'backtest',
  'z': 'disruptor',
  'x': 'discovery',
  'q': 'quant',
  'n': 'scalper',
  'u': 'utility'
};

const getDefaultLayout = (winW: number, winH: number) => ({
  utility: { x: winW / 2 - 400, y: winH / 2 - 250, width: 800, height: 500, isCollapsed: false },
  settings: { x: 24, y: 96, width: 280, height: 400, isCollapsed: false },
  timeline: { x: winW / 2 - 600, y: winH - 150, width: 1200, height: 100, isCollapsed: false },
  groundTruth1: { x: winW * 0.4, y: winH * 0.2, width: 320, height: 200, isCollapsed: false },
  groundTruth2: { x: winW * 0.6, y: winH * 0.4, width: 320, height: 200, isCollapsed: false },
  vfx: { x: winW - 324, y: 96, width: 300, height: 420, isCollapsed: false },
  layers: { x: winW - 364, y: 530, width: 340, height: 480, isCollapsed: false },
  intercepts: { x: 20, y: winH - 340, width: 380, height: 300, isCollapsed: false },
  aiBridge: { x: winW / 2 - 250, y: winH - 200, width: 500, height: 160, isCollapsed: false },
  tasking: { x: winW / 2 - 400, y: 120, width: 300, height: 280, isCollapsed: false },
  syndication: { x: 20, y: 540, width: 380, height: 400, isCollapsed: false },
  security: { x: winW - 400, y: 620, width: 380, height: 320, isCollapsed: false },
  awareness: { x: 20, y: 96, width: 380, height: 320, isCollapsed: false },
  pulse: { x: 20, y: 120, width: 1200, height: 750, isCollapsed: false },
  stack: { x: 20, y: 120, width: 1200, height: 750, isCollapsed: false },
  housing: { x: 20, y: 120, width: 1200, height: 750, isCollapsed: false },
  insider: { x: 20, y: 120, width: 1200, height: 750, isCollapsed: false },
  sigint: { x: 20, y: 120, width: 1200, height: 750, isCollapsed: false },
  capital: { x: 20, y: 120, width: 1200, height: 750, isCollapsed: false },
  decision: { x: 20, y: 120, width: 1200, height: 750, isCollapsed: false },
  money: { x: 20, y: 120, width: 1200, height: 750, isCollapsed: false },
  terafab: { x: 20, y: 120, width: 1200, height: 750, isCollapsed: false },
  government: { x: 20, y: 120, width: 1200, height: 750, isCollapsed: false },
  disruptor: { x: 20, y: 120, width: 1200, height: 750, isCollapsed: false },
  discovery: { x: 20, y: 120, width: 1200, height: 750, isCollapsed: false },
  quant: { x: 20, y: 120, width: 1200, height: 800, isCollapsed: false },
  rehearsal: { x: 20, y: 120, width: 1200, height: 750, isCollapsed: false },
  briefing: { x: winW / 2 - 400, y: winH / 2 - 300, width: 800, height: 600, isCollapsed: false },
  energy: { x: 20, y: 120, width: 1200, height: 750, isCollapsed: false },
  acquisition: { x: 20, y: 120, width: 1200, height: 800, isCollapsed: false },
  header: { x: 0, y: 0, width: winW, height: 80, isCollapsed: false },
  identity: { x: winW / 2 - 350, y: 150, width: 700, height: 600, isCollapsed: false },
  scalper: { x: winW / 2 - 300, y: 300, width: 600, height: 500, isCollapsed: false },
  backtest: { x: winW / 2 - 600, y: 100, width: 1200, height: 800, isCollapsed: false },
});

const DEFAULT_VISIBLE = ['header', 'settings', 'awareness', 'acquisition', 'scalper', 'briefing', 'intercepts', 'vfx', 'layers', 'utility'];














import { useSession } from 'next-auth/react';

export default function NexusDashboard() {
  const router = useRouter();
  const { playClick, toggleMute, isMuted } = useSfx();
  const { data: session } = useSession();
  const { t, locale, setLocale, isRtl } = useTranslation();
  
  const [pulseNodes, setPulseNodes] = useState<{id: number, x: number, y: number, color: string}[]>([]);
  const [threats, setThreats] = useState<{id: string, description: string, category: string, severity: string, ts: string}[]>([]);
  const [gridData, setGridData] = useState({ throughput: "0", latency: 0, crmQueue: 0 });
  const [worldEarthquakes, setWorldEarthquakes] = useState<{id:string, mag:number, place:string}[]>([]);
  const [insights, setInsights] = useState<{id: string, category: string, title: string, priority: string, content: string}[]>([]);
  const [acquisitionSchedule, setAcquisitionSchedule] = useState<{id: string, target: string, sensor: string, status: string, progress: number}[]>([]);
  const [intelFeeds, setIntelFeeds] = useState<IntelligenceFeedItem[]>([]);
  const [activeHUD, setActiveHUD] = useState(true);
  
  // Layout & Visibility State
  const [layout, setLayout] = useState<any>(null);
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(DEFAULT_VISIBLE);
  const [layoutMode, setLayoutMode] = useState<'MANUAL' | 'GRID'>('MANUAL');
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const [generativeInput, setGenerativeInput] = useState('');
  const [generatedWidgets, setGeneratedWidgets] = useState<{id: string, title: string, type: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPresenterActive, setIsPresenterActive] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  // System Environment & Layout State
  const [isMounted, setIsMounted] = useState(false);
  const [winSize, setWinSize] = useState({ w: 1200, h: 800 });
  const [currentSector, setCurrentSector] = useState<'GOVERNMENT' | 'ENERGY' | 'LOGISTICS' | 'COMMERCIAL' | 'GENERAL'>('GOVERNMENT');
  const [pendingSector, setPendingSector] = useState<typeof currentSector | null>(null);
  const [isSectorGuardOpen, setIsSectorGuardOpen] = useState(false);
  const [telemetryMode, setTelemetryMode] = useState<'SIM' | 'LIVE'>('SIM');

  // Neural Sync State
  const [neuralPulse, setNeuralPulse] = useState(0);
  const [isHandshaking, setIsHandshaking] = useState(false);

  // Worldview State
  const [activeStyle, setActiveStyle] = useState<'Normal' | 'CRT' | 'NVG' | 'FLIR' | 'SAR' | 'Anime'>('Normal');
  const [layers, setLayers] = useState({ satellites: true, earthquakes: true, flights: false, cctv: false, weather: false });

  // Client-Side Initialization (SSR Safe)
  useEffect(() => {
    setIsMounted(true);
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    setWinSize({ w: winW, h: winH });
    
    // Load Layout from Disk
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { layout: sLayout, visible: sVisible, mode: sMode } = JSON.parse(saved);
        setLayout(sLayout || getDefaultLayout(winW, winH));
        // Force default visible if for some reason we have none or it was corrupted
        const finalVisible = [...new Set([...sVisible, ...DEFAULT_VISIBLE])];
        setVisibleWidgets(finalVisible);
        if (sMode) setLayoutMode(sMode);
      } catch (e) {
        setLayout(getDefaultLayout(winW, winH));
        setVisibleWidgets(DEFAULT_VISIBLE);
      }
    } else {
      setLayout(getDefaultLayout(winW, winH));
      setVisibleWidgets(DEFAULT_VISIBLE);
    }

    const handleResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      const widgetId = PANEL_KEYS[e.key];
      if (widgetId) {
        setVisibleWidgets(prev => {
          if (prev.includes(widgetId)) {
            return prev.filter(w => w !== widgetId);
          } else {
            return [...prev, widgetId];
          }
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Save Layout to Disk
  useEffect(() => {
    if (isMounted && layout) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        layout, 
        visible: visibleWidgets,
        mode: layoutMode 
      }));
    }
  }, [layout, visibleWidgets, isMounted, layoutMode]);

  const handleResetLayout = () => {
    playClick();
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const clean = getDefaultLayout(winW, winH);
    setLayout(clean);
    setVisibleWidgets(DEFAULT_VISIBLE);
    setGeneratedWidgets([]); // Clear transient AI-generated modules
    localStorage.removeItem(STORAGE_KEY);
  };

  // Live Database Stream
  useEffect(() => {
    if (!isMounted) return;
    const fetchTelemetry = async () => {
      try {
        const res = await fetch(`/api/telemetry?mode=${telemetryMode.toLowerCase()}`);
        const payload = await res.json();
        if (payload.success) {
          setThreats((payload?.data?.intercepts || []).map((t: any) => ({
            ...t,
            description: String(t.description || ''),
            category: String(t.category || ''),
            severity: String(t.severity || ''),
            ts: String(t.ts || '')
          })));
          
          const rawGrid = payload?.data?.grid || {};
          setGridData({
            throughput: String(rawGrid.throughput || "0"),
            latency: Number(rawGrid.latency || 0),
            crmQueue: Number(rawGrid.crmQueue || 0)
          });

          if (payload?.data?.worldIntel) {
              setWorldEarthquakes((payload.data.worldIntel.earthquakes || []).map((e: any) => ({
                ...e,
                place: String(e.place || 'Unknown')
              })));
              setInsights((payload.data.worldIntel.insights || []).map((i: any) => ({
                ...i,
                title: String(i.title || ''),
                content: String(i.content || '')
              })));
              setAcquisitionSchedule((payload.data.worldIntel.acquisitionSchedule || []).map((s: any) => ({
                id: String(s.id || ''),
                target: String(s.target || ''),
                sensor: String(s.sensor || ''),
                status: String(s.status || ''),
                progress: Number(s.progress || 0)
              })));
          }
          
          const feeds = await fetchIntelligenceFeeds();
          setIntelFeeds((feeds || []).map((f: any) => ({
            id: String(f.id || ''),
            source: String(f.source || ''),
            category: String(f.category || ''),
            title: String(f.title || ''),
            summary: String(f.summary || ''),
            ts: String(f.ts || '')
          })));
        }
      } catch (e) {
        // Silent tactical error fallthrough
      }
    };
    
    // Initial Hydration
    fetchTelemetry();
    
    // Polling Loop (Network Stream)
    const dataInterval = setInterval(() => {
        fetchTelemetry();
        setNeuralPulse(p => p + 1); // Ripple global sensory pulse
    }, 4000);
    
    // Set Mounted
    setIsMounted(true);

    return () => {
       clearInterval(dataInterval);
    };
  }, [telemetryMode]); // Refresh stream when mode changes

  const handleSovereignNavigation = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    playClick();
    setIsHandshaking(true);
    setTimeout(() => {
        router.push('/super-admin');
    }, 1000);
  };

  const updateLayout = (id: string, newConfig: any) => {
    setLayout((prev: any) => ({
      ...prev,
      [id]: newConfig
    }));
  };

  const closeWidget = (id: string) => {
    setVisibleWidgets(prev => prev.filter(w => w !== id));
  };

  const handleAction = (cb: () => void) => {
      playClick();
      cb();
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generativeInput) return;
    playClick();
    triggerGeneration(generativeInput);
  };

  const triggerGeneration = (promptText: string) => {
    setIsGenerating(true);
    setGenerativeInput('');
    setVoiceTranscript('');
    
    setTimeout(() => {
      const toolGroup = getGroupedWidgets(promptText);
      
      if (toolGroup) {
        const newWidgets = toolGroup.map(t => ({
          id: `${t.id}-${Date.now()}-${Math.random()}`,
          title: t.title,
          type: t.type
        }));
        setGeneratedWidgets(prev => [...prev, ...newWidgets]);
      } else {
        setGeneratedWidgets(prev => [...prev, {
          id: Date.now().toString(),
          title: promptText.toUpperCase() || 'SYNTHETIC WIDGET',
          type: 'generic'
        }]);
      }
      setIsGenerating(false);
    }, 1500);
  };

  const handleSectorChange = (sector: typeof currentSector) => {
      playClick();
      setPendingSector(sector);
      setIsSectorGuardOpen(true);
  };

  const confirmSectorChange = (choice: 'PERSIST' | 'RESET') => {
      if (!pendingSector) return;
      playClick();
      
      if (choice === 'RESET') {
          setGeneratedWidgets([]);
      }
      
      setCurrentSector(pendingSector);
      setIsSectorGuardOpen(false);
      setPendingSector(null);
  };

  const toggleCognitiveVoice = () => {
    playClick();
    if (isVoiceActive) {
      setIsVoiceActive(false);
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Cognitive Orchestration Voice requires a Chromium-based browser with Speech APIs enabled.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsVoiceActive(true);
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      setVoiceTranscript(event.results[current][0].transcript);
    };

    recognition.onend = () => {
      setIsVoiceActive(false);
      if (voiceTranscript || generativeInput) {
          triggerGeneration(voiceTranscript || generativeInput);
      }
    };

    recognition.start();
  };

  return (
    <div className="w-screen h-screen bg-[#020202] text-white font-mono overflow-hidden relative selection:bg-cyan-500/30" dir={isRtl ? 'rtl' : 'ltr'}>
      <MatrixRain color="#101827" className="opacity-10 pointer-events-none absolute inset-0 z-0" />
      
      {/* NEURAL HANDSHAKE OVERLAY */}
      <NeuralHandshake isVisible={isHandshaking} />

      {/* GLOBAL NEURAL PULSE LAYER */}
      <AnimatePresence>
        <motion.div 
          key={neuralPulse}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.04, 0] }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 pointer-events-none z-[100] bg-cyan-500/5 mix-blend-screen"
        />
      </AnimatePresence>

      {/* BACKGROUND: THE INFRA-SIGHT 3D GLOBE ENGINE */}
      <div className={`absolute inset-0 z-0 transition-all duration-700 ${activeStyle !== 'Normal' ? 'map-style-' + activeStyle.toLowerCase() : ''}`}>
           <IntelligenceGlobe />
      </div>

      {/* ADVANCED HUD OVERLAY GRID */}
      <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Static corners */}
          <div className={`absolute top-24 ${isRtl ? 'right-6' : 'left-6'} text-[10px] text-green-500/50`}>SYS: 30U YC 028</div>
          <div className={`absolute bottom-6 ${isRtl ? 'right-6' : 'left-6'} text-[10px] text-amber-500/50`}>GSD: 12255.15M NIIRS: 9.0<br/>ALT: 32680411M SUN: -31.0 EL</div>
      </div>

      {/* HUD OVERLAY CONTAINER */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        
        {/* PERSONAPLEX GENERATIVE INTENT BAR (DRAGGABLE) */}
        <div className="absolute inset-0 pointer-events-none z-[60]">
          <Rnd
            default={{
              x: (winSize.w - 896) / 2,
              y: 112,
              width: 896,
              height: 48,
            }}
            minWidth={400}
            enableResizing={false}
            bounds="window"
            dragHandleClassName="personaplex-drag-handle"
            className="pointer-events-auto"
          >
            <PersonaplexBar 
              onGenerate={triggerGeneration}
              isGenerating={isGenerating}
            />
          </Rnd>
        </div>

        {/* SOTA CAMERA PRESENTER (PiP) */}
        <AnimatePresence>
          {isPresenterActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 pointer-events-none z-[80]"
            >
              <div className="pointer-events-auto h-full w-full">
                <CameraPresenter onClose={() => setIsPresenterActive(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeHUD && isMounted && layout && (
            <ErrorBoundary name="NexusHUD">
              <div className={layoutMode === 'GRID' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-8 pt-32 w-full h-full overflow-y-auto relative pointer-events-auto" : "absolute inset-0 pointer-events-none"}>
                
                {/* COMMAND HEADER / NAV */}
                {visibleWidgets.includes('header') && (
                  <NexusWindowPrimitive
                    id="header"
                    title={t('panel.command_control')}
                    icon={<InfraConnectLogo size="xs" />}
                    defaultPos={layout.header}
                    isCollapsed={layout.header?.isCollapsed ?? false}
                    onClose={closeWidget}
                    onLayoutChange={updateLayout}
                    onFocus={setFocusedId}
                    zIndex={focusedId === 'header' ? 70 : 50}
                    layoutMode={layoutMode}
                    hideHeader={true}
                  >
                    <div className={`flex items-center gap-4 px-6 h-12 bg-black/40 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${layoutMode === 'MANUAL' ? 'nexus-drag-handle cursor-grab active:cursor-grabbing' : ''} ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <InfraConnectLogo size="md" />
                      
                      <div className="h-6 w-px bg-slate-800/50 mx-2" />
                      
                      <button 
                        onClick={() => setLayoutMode(layoutMode === 'MANUAL' ? 'GRID' : 'MANUAL')} 
                        className={`px-3 py-1.5 rounded-lg border transition-all uppercase text-[10px] font-black tracking-widest ${layoutMode === 'GRID' ? 'bg-cyan-900/40 border-cyan-500/40 text-cyan-400' : 'bg-slate-900/50 border-slate-800 text-slate-500'}`}
                      >
                         LAYOUT: {layoutMode}
                      </button>
                      <button onClick={handleResetLayout} className="px-3 py-1.5 rounded-lg border bg-red-950/20 border-red-500/40 text-red-400 hover:bg-red-500/20 transition-all uppercase text-[10px] font-black tracking-widest">
                         {t('common.reset')}
                      </button>
                      
                      <div className="h-6 w-px bg-slate-800/50 mx-2" />

                      <div className="flex items-center bg-black/40 border border-slate-700/50 rounded-lg p-1 mr-4">
                         {(['en', 'fr', 'de', 'es', 'nl', 'pt', 'it', 'ru', 'ar', 'hi'] as const).map((l) => (
                           <button 
                             key={l}
                             onClick={() => handleAction(() => setLocale(l))}
                             className={`px-2 py-1 rounded text-[9px] transition-all hover:text-white font-black uppercase ${locale === l ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-500/30' : 'text-slate-600'}`}
                           >
                             {l}
                           </button>
                         ))}
                      </div>
                      
                      <span className="text-amber-500/80 font-black text-[9px] tracking-[0.2em] hidden xl:block border-x border-slate-800/50 px-4">ENTERPRISE CLOUD // STABLE // SECURE</span>
                      
                      <div className="flex-1" />

                      <div className="flex items-center bg-black/40 border border-slate-700/50 rounded-lg p-1">
                         <button 
                           onClick={() => handleAction(() => setTelemetryMode('SIM'))}
                           className={`px-3 py-1 rounded text-[9px] transition-all hover:text-white font-bold ${telemetryMode === 'SIM' ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/30' : 'text-slate-600'}`}
                         >
                            {t('common.sim')}
                         </button>
                         <button 
                           onClick={() => handleAction(() => setTelemetryMode('LIVE'))}
                           className={`px-3 py-1 rounded text-[9px] transition-all hover:text-white font-bold ${telemetryMode === 'LIVE' ? 'bg-amber-900/40 text-amber-400 border border-amber-500/30' : 'text-slate-600'}`}
                         >
                            {t('common.live')}
                         </button>
                      </div>

                      <select 
                        value={currentSector} 
                        onChange={(e) => handleSectorChange(e.target.value as any)}
                        className="bg-black/40 border border-slate-700/50 text-[10px] text-cyan-400 px-3 py-1.5 rounded-lg outline-none focus:border-cyan-500 transition-colors cursor-pointer font-black tracking-widest"
                      >
                        <option value="ENERGY">{t('common.sector')}: ENERGY</option>
                        <option value="LOGISTICS">{t('common.sector')}: LOGISTICS</option>
                        <option value="COMMERCIAL">{t('common.sector')}: BIZ</option>
                        <option value="GENERAL">{t('common.sector')}: GEN</option>
                        <option value="MARKET">{t('common.sector')}: MARKET</option>
                      </select>

                      {/* PORTAL CONTROLLER */}
                      <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-800 rounded-lg p-1 mr-2">
                        <Link 
                          href="/dashboard"
                          className="px-3 py-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all uppercase text-[10px] font-black group tracking-widest"
                        >
                          {t('nav.dashboard')}
                        </Link>
                        <Link 
                          href="/enterprise-admin"
                          className="px-3 py-1.5 rounded-lg text-cyan-500 hover:bg-cyan-500/20 transition-all uppercase text-[10px] font-black group tracking-widest"
                        >
                          {t('nav.admin')}
                        </Link>
                        <Link 
                          href="/super-admin"
                          className="px-3 py-1.5 rounded-lg text-amber-500 hover:bg-amber-500/20 transition-all uppercase text-[10px] font-black group tracking-widest"
                        >
                          {t('nav.governance')}
                        </Link>
                        <Link 
                          href="/"
                          className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-white transition-all uppercase text-[10px] font-black tracking-widest"
                        >
                          {t('nav.home')}
                        </Link>
                      </div>

                      {/* SYSTEM OVERLORD ENTRY (Legacy Toggle) */}
                      {(session?.user as any)?.role === 'superadmin' && (
                        <button 
                          onClick={handleSovereignNavigation}
                          className="flex items-center gap-3 px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-500 hover:bg-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all uppercase text-[10px] font-black group tracking-widest shadow-2xl mr-2"
                        >
                          <ShieldAlert className="w-4 h-4 group-hover:animate-pulse" />
                          Governance Core
                        </button>
                      )}

                    </div>
                  </NexusWindowPrimitive>
                )}
            <div className={layoutMode === 'GRID' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-8 pt-32 w-full h-full overflow-y-auto relative" : "fixed inset-0 pointer-events-none"}>
            {/* SETTINGS PANEL */}
            {visibleWidgets.includes('settings') && (
              <NexusWindowPrimitive 
                id="settings" 
                title={t('panel.ops_console')} 
                icon={<Settings2 className="w-3 h-3 text-cyan-500" />}
                defaultPos={layout.settings || { x: 24, y: 96, width: 280, height: 400 }}
                isCollapsed={layout.settings?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'settings' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <TacticalSettingsBar onReset={handleResetLayout} />
                  </div>
                  <div className="p-4 border-t border-white/5 bg-black/20">
                    <RecordingController 
                      onTogglePresenter={() => setIsPresenterActive(!isPresenterActive)}
                      isPresenterActive={isPresenterActive}
                    />
                    <div className="mt-4 pt-4 border-t border-white/5 text-[7px] font-black uppercase tracking-[0.3em] text-slate-800 text-center">
                       © 2026 INFRACONNECT // INFRA-SYNC
                    </div>
                  </div>
                </div>
              </NexusWindowPrimitive>
            )}

            {/* TIMELINE CONTROLLER */}
            {visibleWidgets.includes('timeline') && (
              <NexusWindowPrimitive 
                id="timeline" 
                title={t('panel.context_sync')} 
                icon={<Activity className="w-3 h-3 text-purple-500" />}
                defaultPos={layout.timeline || { x: 400, y: 700, width: 1200, height: 100 }}
                isCollapsed={layout.timeline?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'timeline' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <TimelineController />
                <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[10px] text-white font-black uppercase tracking-tight">{t('panel.mission_scene')} // 09-AZURE</span>
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{t('panel.ops_timeline')} // Synchronized</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                         <span className="text-[7px] text-slate-600 font-black uppercase tracking-widest">Buffer_State</span>
                         <span className="text-[10px] text-cyan-500 font-black tabular-nums">0.0ms</span>
                      </div>
                      <div className="w-px h-6 bg-white/5" />
                      <div className="flex flex-col items-end">
                         <span className="text-[7px] text-slate-600 font-black uppercase tracking-widest">Sync_Status</span>
                         <span className="text-[10px] text-emerald-500 font-black tracking-widest uppercase">STABLE</span>
                      </div>
                   </div>
                </div>
              </NexusWindowPrimitive>
            )}

            {/* GROUND TRUTH 1 */}
            {visibleWidgets.includes('groundTruth1') && (
              <NexusWindowPrimitive 
                id="groundTruth1" 
                title={t('panel.operational_truth')} 
                icon={<ShieldAlert className="w-3 h-3 text-red-500" />}
                defaultPos={layout.groundTruth1 || { x: 100, y: 100, width: 400, height: 300 }}
                isCollapsed={layout.groundTruth1?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'groundTruth1' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <GroundTruthCard 
                  attacker={{ name: insights[0]?.category || 'SYS', flag: '📡' }}
                  target={{ name: 'TIER-1 CORE', flag: '🔒' }}
                  date={new Date(insights[0]?.ts || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                  category={insights[0]?.category || "INFRASTRUCTURE"}
                  verified={true}
                  title={insights[0]?.title || "Awaiting Intelligence Ingestion..."}
                  description={insights[0]?.content || "System scanning for anomalous tactical vectors..."}
                />
              </NexusWindowPrimitive>
            )}



            {/* ACTIVE STYLE VFX */}
            {visibleWidgets.includes('vfx') && (
              <NexusWindowPrimitive 
                id="vfx" 
                title={t('panel.vfx_interface')} 
                icon={<Video className="w-3 h-3 text-cyan-500" />}
                defaultPos={layout.vfx || { x: 50, y: 50, width: 300, height: 200 }}
                isCollapsed={layout.vfx?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'vfx' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <div className="w-full h-full bg-black/40 flex flex-col p-4 space-y-5">
                   <div className="flex justify-between items-center gap-2 text-[10px] overflow-x-auto pb-2 custom-scrollbar">
                      {['Normal', 'CRT', 'NVG', 'FLIR', 'SAR', 'Anime'].map(style => (
                          <button 
                            key={style}
                            onClick={() => handleAction(() => setActiveStyle(style as any))}
                            className={`px-3 py-2 rounded-lg flex-shrink-0 transition-colors ${activeStyle === style ? 'bg-cyan-900/60 text-cyan-400 border border-cyan-500' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}
                          >
                              {style}
                          </button>
                      ))}
                   </div>
                   
                   <div className="space-y-4 pt-2">
                       {[
                         {label: 'Bloom', val: 100},
                         {label: 'Sharpen', val: 56},
                         {label: 'Pixelation', val: 12},
                         {label: 'Distortion', val: 88}
                       ].map(vfx => (
                           <div key={vfx.label} className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                 <span className="text-[10px] text-slate-300 uppercase flex items-center gap-2">
                                     <Settings2 className="w-3 h-3 text-cyan-500" /> {vfx.label}
                                 </span>
                                 <span className="text-[10px] font-mono text-slate-500">{vfx.val}%</span>
                              </div>
                              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden relative">
                                 <div className="absolute top-0 left-0 h-full bg-cyan-500" style={{ width: `${vfx.val}%`}} />
                              </div>
                           </div>
                       ))}
                   </div>
                </div>
              </NexusWindowPrimitive>
            )}

            {/* LAYER REGISTRY */}
            {visibleWidgets.includes('layers') && (
              <NexusWindowPrimitive 
                id="layers" 
                title={t('panel.intel_layers')} 
                icon={<Database className="w-3 h-3 text-cyan-500" />}
                defaultPos={layout.layers || { x: 80, y: 80, width: 300, height: 400 }}
                isCollapsed={layout.layers?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'layers' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <LayerRegistryGrid />
              </NexusWindowPrimitive>
            )}

            {/* INTERCEPTS */}
            {visibleWidgets.includes('intercepts') && (
              <NexusWindowPrimitive 
                id="intercepts" 
                title={t('panel.system_telemetry')} 
                icon={<TermIcon className="w-3 h-3 text-red-500" />}
                defaultPos={layout.intercepts || { x: 120, y: 120, width: 400, height: 300 }}
                isCollapsed={layout.intercepts?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'intercepts' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <IntelligenceVaultGuard requiredSector="GOVERNMENT" currentSector={currentSector}>
                  <div className="w-full h-full bg-black/40 p-6 overflow-y-auto space-y-3 custom-scrollbar relative">
                    <AnimatePresence>
                      {threats.map((t, i) => (
                        <motion.div 
                          key={t.id}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex justify-between items-center border-l-2 border-cyan-500/40 bg-white/[0.02] p-4 rounded-r-xl hover:bg-cyan-500/[0.05] hover:border-cyan-500 cursor-crosshair transition-all group/telemetry"
                        >
                          <div className="flex flex-col gap-1">
                             <span className="text-[10px] text-white font-black uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{t.description}</span>
                             <div className="flex items-center gap-3">
                                <TechnicalBadge variant="amber">{t.category}</TechnicalBadge>
                                <span className="text-[8px] text-slate-600 font-mono tracking-tighter uppercase">Source_ID: {t.id.substring(0, 8)}</span>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="h-1 w-24 bg-slate-900 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '80%' }} className="h-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]" />
                             </div>
                             <span className="text-cyan-500 font-black animate-pulse">LIVE</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {/* Telemetry Stream Scanline */}
                    <motion.div 
                        className="absolute inset-x-0 h-px bg-cyan-500/10 shadow-[0_0_10px_rgba(34,211,238,0.2)] pointer-events-none"
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </IntelligenceVaultGuard>
              </NexusWindowPrimitive>
            )}

            {/* COGNITIVE CORE BRIDGE */}
            {visibleWidgets.includes('aiBridge') && (
              <NexusWindowPrimitive 
                id="aiBridge" 
                title={t('panel.cognitive_bridge')} 
                icon={<Brain className="w-3 h-3 text-cyan-500" />}
                defaultPos={layout.aiBridge || { x: 150, y: 150, width: 500, height: 600 }}
                isCollapsed={layout.aiBridge?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'aiBridge' ? 60 : 40}
                layoutMode={layoutMode}
                hideHeader={true}
              >
                 <div className="w-full h-full bg-black/40 px-6 py-4 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest leading-none">Cognitive Orchestration</span>
                        {isGenerating && <span className="text-[10px] text-cyan-500 animate-pulse">SYNTHESIZING...</span>}
                    </div>
                    <form onSubmit={handleGenerate} className="mt-auto mb-2 border border-slate-700/50 rounded-lg bg-black/50 flex flex-row items-center relative overflow-hidden focus-within:border-cyan-500/50 transition-colors">
                       <button type="button" onClick={() => handleAction(toggleCognitiveVoice)} className={`absolute left-2 p-1.5 rounded-full z-10 transition-all ${isVoiceActive ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-slate-500 hover:text-cyan-400'}`}>
                         {isVoiceActive ? <Mic className="w-3 h-3 animate-pulse" /> : <MicOff className="w-3 h-3" />}
                       </button>
                       <input 
                         type="text" 
                         disabled={isGenerating || isVoiceActive}
                         value={isVoiceActive ? voiceTranscript : generativeInput}
                         onChange={e => setGenerativeInput(e.target.value)}
                         placeholder={isVoiceActive ? "Listening for Directives..." : "E.g., Map validation status for Agent-01..."}
                         className="w-full bg-transparent border-none outline-none text-[11px] font-mono pl-10 pr-4 py-3 text-white placeholder:text-slate-600 focus:ring-0"
                       />
                    </form>
                 </div>
              </NexusWindowPrimitive>
            )}

            {/* TASKING */}
            {visibleWidgets.includes('tasking') && (
              <NexusWindowPrimitive 
                id="tasking" 
                title={t('panel.infra_orchestration')} 
                icon={<Target className="w-3 h-3 text-amber-500" />}
                defaultPos={layout.tasking || { x: 200, y: 200, width: 400, height: 300 }}
                isCollapsed={layout.tasking?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'tasking' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <IntelligenceVaultGuard requiredSector="ENERGY" currentSector={currentSector}>
                  <div className="w-full h-full bg-black/40 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                    {acquisitionSchedule.map(task => (
                       <div key={task.id} className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                             <span className="text-slate-200 uppercase font-mono">{task.target}</span>
                             <span className="text-slate-500 uppercase">{task.sensor}</span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                             <div className={`h-full bg-amber-500 transition-all duration-1000`} style={{ width: `${task.progress}%` }} />
                          </div>
                       </div>
                    ))}
                    <button className="w-full py-2 border border-slate-700 rounded text-[9px] text-slate-500 hover:bg-slate-900 transition-all uppercase mt-2">
                       + Deploy Synthetic Sweep
                    </button>
                  </div>
                </IntelligenceVaultGuard>
              </NexusWindowPrimitive>
            )}

            {/* SYNDICATION */}
            {visibleWidgets.includes('syndication') && (
              <NexusWindowPrimitive 
                id="syndication" 
                title={t('panel.market_intel')} 
                icon={<Database className="w-3 h-3 text-cyan-500" />}
                defaultPos={layout.syndication || { x: 250, y: 250, width: 400, height: 300 }}
                isCollapsed={layout.syndication?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'syndication' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <div className="w-full h-full bg-black/40 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                  {intelFeeds.map(feed => (
                     <div key={feed.id} className="p-3 rounded border border-slate-800 bg-slate-900/40 group hover:border-cyan-500/30 transition-all">
                        <div className="flex justify-between items-start mb-2">
                           <span className={`text-[8px] px-2 py-0.5 rounded font-black tracking-widest ${feed.source === 'BLOOMBERG' ? 'bg-amber-500/10 text-amber-500' : 'bg-cyan-900/40 text-cyan-400'}`}>
                              {feed.source} // {feed.category}
                           </span>
                           <span className="text-[8px] text-slate-600">{new Date(feed.ts).toLocaleTimeString()}</span>
                        </div>
                        <h4 className="text-[11px] font-black text-white uppercase mb-1 leading-tight group-hover:text-cyan-400 transition-colors">{feed.title}</h4>
                     </div>
                  ))}
                </div>
              </NexusWindowPrimitive>
            )}

            {/* SECURITY */}
            {visibleWidgets.includes('security') && (
              <NexusWindowPrimitive 
                id="security" 
                title={t('panel.security_monitor')} 
                icon={<ShieldCheck className="w-3 h-3 text-red-500" />}
                defaultPos={layout.security || { x: 300, y: 300, width: 400, height: 400 }}
                isCollapsed={layout.security?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'security' ? 60 : 40}
                layoutMode={layoutMode}
              >
                 <SecurityPostureGuard />
              </NexusWindowPrimitive>
            )}

            {/* WORKSPACE AWARENESS */}
            {visibleWidgets.includes('awareness') && (
              <NexusWindowPrimitive 
                id="awareness" 
                title={t('panel.workspace_matrix')} 
                icon={<Monitor className="w-3 h-3 text-cyan-500" />}
                defaultPos={layout.awareness || { x: 350, y: 350, width: 400, height: 400 }}
                isCollapsed={layout.awareness?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'awareness' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <EnvironmentAwareness />
              </NexusWindowPrimitive>
            )}

            {/* SOVEREIGN DEVELOPMENT HUB */}
            {visibleWidgets.includes('sdh') && (
              <NexusWindowPrimitive 
                id="sdh" 
                title={t('panel.mission_control')} 
                icon={<Binary className="w-3 h-3 text-indigo-500" />}
                defaultPos={layout.sdh || { x: 50, y: 50, width: 400, height: 300 }}
                isCollapsed={layout.sdh?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'sdh' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <SovereignDevHub />
              </NexusWindowPrimitive>
            )}

            {/* SYMMETRIC SIMULATION ENGINE */}
            {visibleWidgets.includes('sim') && (
              <NexusWindowPrimitive 
                id="sim" 
                title={t('panel.symmetric_sim')} 
                icon={<History className="w-3 h-3 text-orange-500" />}
                defaultPos={layout.sim || { x: 150, y: 150, width: 400, height: 300 }}
                isCollapsed={layout.sim?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'sim' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <SimController />
              </NexusWindowPrimitive>
            )}

            {/* CIVILIZATIONAL PULSE LENS */}
            {visibleWidgets.includes('pulse') && (
              <NexusWindowPrimitive 
                id="pulse" 
                title={t('panel.civilizational_pulse')} 
                icon={<Activity className="w-3 h-3 text-emerald-500" />}
                defaultPos={layout.pulse || { x: 250, y: 250, width: 400, height: 300 }}
                isCollapsed={layout.pulse?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'pulse' ? 160 : 99}
                layoutMode={layoutMode}
              >
                <CivilizationalPulseLens />
              </NexusWindowPrimitive>
            )}

            {/* FINANCIAL STACK MATRIX */}
            {visibleWidgets.includes('stack') && (
              <NexusWindowPrimitive 
                id="stack" 
                title={t('panel.financial_stack')} 
                icon={<CreditCard className="w-3 h-3 text-blue-500" />}
                defaultPos={layout.stack || { x: 350, y: 350, width: 400, height: 300 }}
                isCollapsed={layout.stack?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'stack' ? 160 : 99}
                layoutMode={layoutMode}
              >
                <FinancialStackMatrix />
              </NexusWindowPrimitive>
            )}

            {/* GLOBAL REAL ESTATE REGISTRY */}
            {visibleWidgets.includes('housing') && (
              <NexusWindowPrimitive 
                id="housing" 
                title={t('panel.real_estate')} 
                icon={<Home className="w-3 h-3 text-amber-500" />}
                defaultPos={layout.housing || { x: 450, y: 450, width: 400, height: 300 }}
                isCollapsed={layout.housing?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'housing' ? 160 : 99}
                layoutMode={layoutMode}
              >
                <GlobalRealEstateRegistry />
              </NexusWindowPrimitive>
            )}

            {/* INSIDER INTELLIGENCE HUB */}
            {visibleWidgets.includes('insider') && (
              <NexusWindowPrimitive 
                id="insider" 
                title={t('panel.insider_intel')} 
                icon={<Lock className="w-3 h-3 text-indigo-500" />}
                defaultPos={layout.insider || { x: 100, y: 100, width: 400, height: 300 }}
                isCollapsed={layout.insider?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'insider' ? 160 : 99}
                layoutMode={layoutMode}
              >
                <InsiderIntelligenceHub />
              </NexusWindowPrimitive>
            )}

            {/* SIGNAL INTELLIGENCE LENS */}
            {visibleWidgets.includes('sigint') && (
              <NexusWindowPrimitive 
                id="sigint" 
                title={t('panel.sigint_lens')} 
                icon={<Zap className="w-3 h-3 text-cyan-500" />}
                defaultPos={layout.sigint || { x: 200, y: 100, width: 400, height: 300 }}
                isCollapsed={layout.sigint?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'sigint' ? 160 : 99}
                layoutMode={layoutMode}
              >
                <SignalIntelligenceLens />
              </NexusWindowPrimitive>
            )}

            {/* CAPITAL FLOW MATRIX */}
            {visibleWidgets.includes('capital') && (
              <NexusWindowPrimitive 
                id="capital" 
                title={t('panel.capital_matrix')} 
                icon={<TrendingUp className="w-3 h-3 text-blue-500" />}
                defaultPos={layout.capital || { x: 300, y: 100, width: 400, height: 300 }}
                isCollapsed={layout.capital?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'capital' ? 160 : 99}
                layoutMode={layoutMode}
              >
                <CapitalFlowMatrix />
              </NexusWindowPrimitive>
            )}

            {/* DECISION MAKER PULSE */}
            {visibleWidgets.includes('decision') && (
              <NexusWindowPrimitive 
                id="decision" 
                title={t('panel.decision_pulse')} 
                icon={<Users className="w-3 h-3 text-indigo-500" />}
                defaultPos={layout.decision || { x: 400, y: 100, width: 400, height: 300 }}
                isCollapsed={layout.decision?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'decision' ? 160 : 99}
                layoutMode={layoutMode}
              >
                <DecisionMakerPulse />
              </NexusWindowPrimitive>
            )}

            {/* DIGITAL MONEY MATRIX */}
            {visibleWidgets.includes('money') && (
              <NexusWindowPrimitive 
                id="money" 
                title={t('panel.digital_money')} 
                icon={<DollarSign className="w-3 h-3 text-emerald-500" />}
                defaultPos={layout.money || { x: 100, y: 200, width: 400, height: 300 }}
                isCollapsed={layout.money?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'money' ? 160 : 99}
                layoutMode={layoutMode}
              >
                <DigitalMoneyMatrix />
              </NexusWindowPrimitive>
            )}

            {/* TERAFAB COMPUTE LENS */}
            {visibleWidgets.includes('terafab') && (
              <NexusWindowPrimitive 
                id="terafab" 
                title={t('panel.terafab_compute')} 
                icon={<Cpu className="w-3 h-3 text-cyan-500" />}
                defaultPos={layout.terafab || { x: 200, y: 200, width: 400, height: 300 }}
                isCollapsed={layout.terafab?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'terafab' ? 160 : 99}
                layoutMode={layoutMode}
              >
                <TerafabComputeLens />
              </NexusWindowPrimitive>
            )}

            {/* SOVEREIGN BANK MONITOR */}
            {visibleWidgets.includes('government') && (
              <NexusWindowPrimitive 
                id="government" 
                title={t('panel.sovereign_monitor')} 
                icon={<Landmark className="w-3 h-3 text-amber-500" />}
                defaultPos={layout.government || { x: 300, y: 200, width: 400, height: 300 }}
                isCollapsed={layout.government?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'government' ? 160 : 99}
                layoutMode={layoutMode}
              >
                <SovereignBankMonitor />
              </NexusWindowPrimitive>
            )}

            {/* AUTONOMOUS DISRUPTOR SWARM */}
            {visibleWidgets.includes('disruptor') && (
              <NexusWindowPrimitive 
                id="disruptor" 
                title={t('panel.disruptor_swarm')} 
                icon={<Brain className="w-3 h-3 text-indigo-500" />}
                defaultPos={layout.disruptor || { x: 400, y: 200, width: 400, height: 300 }}
                isCollapsed={layout.disruptor?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'disruptor' ? 160 : 99}
                layoutMode={layoutMode}
              >
                <AutonomousDisruptorSwarm />
              </NexusWindowPrimitive>
            )}

            {/* QUANT RESEARCH TRADER HUB */}
            {visibleWidgets.includes('quant') && (
              <NexusWindowPrimitive 
                id="quant" 
                title={t('panel.quant_research')} 
                icon={<TrendingUp className="w-3 h-3 text-emerald-500" />}
                defaultPos={layout.quant || { x: 100, y: 300, width: 400, height: 300 }}
                isCollapsed={layout.quant?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'quant' ? 170 : 100}
                layoutMode={layoutMode}
              >
                <QuantResearchTrader />
              </NexusWindowPrimitive>
            )}

            {/* NEXUS SCALPER HUB */}
            {visibleWidgets.includes('scalper') && (
              <NexusWindowPrimitive 
                id="scalper" 
                title={t('panel.nexus_scalper')} 
                icon={<Zap className="w-3 h-3 text-cyan-400" />}
                defaultPos={layout.scalper || { x: 500, y: 300, width: 600, height: 450 }}
                isCollapsed={layout.scalper?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'scalper' ? 160 : 99}
                layoutMode={layoutMode}
              >
                <NexusScalper />
              </NexusWindowPrimitive>
            )}

            {/* SOVEREIGN IDENTITY HUB */}
            {visibleWidgets.includes('identity') && (
              <NexusWindowPrimitive 
                id="identity" 
                title={t('panel.sovereign_identity')} 
                icon={<User className="w-3 h-3 text-blue-500" />}
                defaultPos={layout.identity || { x: 400, y: 150, width: 700, height: 600 }}
                isCollapsed={layout.identity?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'identity' ? 160 : 99}
                layoutMode={layoutMode}
              >
                <SovereignIdentity />
              </NexusWindowPrimitive>
            )}

            {/* VISUAL BACKTEST HUB */}
            {visibleWidgets.includes('backtest') && (
              <NexusWindowPrimitive 
                id="backtest" 
                title={t('panel.backtest_hub')} 
                icon={<TrendingUp className="w-3 h-3 text-indigo-400" />}
                defaultPos={layout.backtest || { x: 100, y: 100, width: 1200, height: 800 }}
                isCollapsed={layout.backtest?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'backtest' ? 180 : 110}
                layoutMode={layoutMode}
              >
                <VisualBacktestHub />
              </NexusWindowPrimitive>
            )}

            {/* SAR DISCOVERY ENGINE */}

            {visibleWidgets.includes('discovery') && (
              <NexusWindowPrimitive 
                id="discovery" 
                title={t('panel.sar_discovery')} 
                icon={<Satellite className="w-3 h-3 text-cyan-500" />}
                defaultPos={layout.discovery || { x: 500, y: 100, width: 400, height: 300 }}
                isCollapsed={layout.discovery?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'discovery' ? 160 : 99}
                layoutMode={layoutMode}
              >
                <SARDiscoveryEngine />
              </NexusWindowPrimitive>
            )}





            {/* DATA LINEAGE VISUALIZER */}
            {visibleWidgets.includes('lineage') && (
              <NexusWindowPrimitive 
                id="lineage" 
                title={t('panel.data_lineage')} 
                icon={<GitBranch className="w-3 h-3 text-indigo-500" />}
                defaultPos={layout.lineage || { x: 600, y: 100, width: 400, height: 300 }}
                isCollapsed={layout.lineage?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'lineage' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <LineageGraph />
              </NexusWindowPrimitive>
            )}

            {/* ASSET INTELLIGENCE HUB */}
            {visibleWidgets.includes('acquisition') && (
              <NexusWindowPrimitive 
                id="acquisition" 
                title={t('panel.asset_acquisition')} 
                icon={<Target className="w-3 h-3 text-indigo-500" />}
                defaultPos={layout.acquisition || { x: 700, y: 100, width: 400, height: 300 }}
                isCollapsed={layout.acquisition?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'acquisition' ? 150 : 98}
                layoutMode={layoutMode}
              >
                <AssetIntelligenceHub />
              </NexusWindowPrimitive>
            )}

            {visibleWidgets.includes('energy') && (
              <NexusWindowPrimitive 
                id="energy" 
                title={t('panel.energy_intelligence')} 
                icon={<Droplets className="w-3 h-3 text-amber-500" />}
                defaultPos={layout.energy || { x: 800, y: 100, width: 400, height: 300 }}
                isCollapsed={layout.energy?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'energy' ? 140 : 97}
                layoutMode={layoutMode}
              >
                <EnergySectorLens />
              </NexusWindowPrimitive>
            )}

            {visibleWidgets.includes('briefing') && (
              <NexusWindowPrimitive 
                id="briefing" 
                title={t('panel.briefing')} 
                icon={<Target className="w-3 h-3 text-indigo-500" />}
                defaultPos={layout.briefing || { x: 900, y: 100, width: 400, height: 300 }}
                isCollapsed={layout.briefing?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'briefing' ? 130 : 96}
                layoutMode={layoutMode}
              >
                <MissionBriefing />
              </NexusWindowPrimitive>
            )}

            {/* TACTICAL UTILITY SUITE */}
            {visibleWidgets.includes('utility') && (
              <NexusWindowPrimitive 
                id="utility" 
                title={t('widget.clock') + " // " + t('common.tools')} 
                icon={<Globe className="w-3 h-3 text-cyan-400" />}
                defaultPos={layout.utility || { x: 300, y: 200, width: 800, height: 500 }}
                isCollapsed={layout.utility?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'utility' ? 200 : 120}
                layoutMode={layoutMode}
              >
                <TacticalUtilitySuite />
              </NexusWindowPrimitive>
            )}

            {visibleWidgets.includes('rehearsal') && (
              <NexusWindowPrimitive 
                id="rehearsal" 
                title={t('panel.rehearsal')} 
                icon={<Share2 className="w-3 h-3 text-indigo-500" />}
                defaultPos={layout.rehearsal || { x: 400, y: 100, width: 400, height: 300 }}
                isCollapsed={layout.rehearsal?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'rehearsal' ? 120 : 95}
                layoutMode={layoutMode}
              >
                <StrategicRehearsalNexus />
              </NexusWindowPrimitive>
            )}

            {visibleWidgets.includes('jitro') && (
              <NexusWindowPrimitive 
                id="jitro" 
                title={t('panel.outcomes')} 
                icon={<Brain className="w-3 h-3 text-cyan-500" />}
                defaultPos={layout.jitro || { x: 100, y: 400, width: 400, height: 300 }}
                isCollapsed={layout.jitro?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'jitro' ? 110 : 90}
                layoutMode={layoutMode}
              >
                <JitroHub />
              </NexusWindowPrimitive>
            )}

            {visibleWidgets.includes('concurrent') && (
              <NexusWindowPrimitive 
                id="concurrent" 
                title={t('panel.mission_hub')} 
                icon={<Monitor className="w-3 h-3 text-indigo-500" />}
                defaultPos={layout.concurrent || { x: 200, y: 200, width: 500, height: 400 }}
                isCollapsed={layout.concurrent?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'concurrent' ? 100 : 80}
                layoutMode={layoutMode}
              >
                <ConcurrentMissionNexus />
              </NexusWindowPrimitive>
            )}

            {visibleWidgets.includes('swarm') && (
              <NexusWindowPrimitive 
                id="swarm" 
                title={t('panel.swarm')} 
                icon={<Users className="w-3 h-3 text-indigo-500" />}
                defaultPos={layout.swarm || { x: 50, y: 50, width: 300, height: 400 }}
                isCollapsed={layout.swarm?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'swarm' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <SovereignSwarmManager />
              </NexusWindowPrimitive>
            )}

            {visibleWidgets.includes('geospatial') && (
              <NexusWindowPrimitive 
                id="geospatial" 
                title={t('panel.geospatial')} 
                icon={<MapIcon className="w-3 h-3 text-emerald-500" />}
                defaultPos={layout.geospatial || { x: 800, y: 400, width: 400, height: 300 }}
                isCollapsed={layout.geospatial?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'geospatial' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <GeospatialHub />
              </NexusWindowPrimitive>
            )}

            {visibleWidgets.includes('multiverse') && (
              <NexusWindowPrimitive 
                id="multiverse" 
                title={t('panel.multiverse')} 
                icon={<Layers className="w-3 h-3 text-indigo-500" />}
                defaultPos={layout.multiverse || { x: 100, y: 100, width: 400, height: 300 }}
                isCollapsed={layout.multiverse?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'multiverse' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <MultiverseSim />
              </NexusWindowPrimitive>
            )}

            {/* NEURAL RESONANCE AUTHORIZATION */}
            {visibleWidgets.includes('resonance') && (
              <NexusWindowPrimitive 
                id="resonance" 
                title={t('panel.resonance')} 
                icon={<Waves className="w-3 h-3 text-emerald-500" />}
                defaultPos={layout.resonance || { x: 500, y: 500, width: 400, height: 300 }}
                isCollapsed={layout.resonance?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'resonance' ? 70 : 50}
                layoutMode={layoutMode}
              >
                <ResonanceAuthorize />
              </NexusWindowPrimitive>
            )}

            {visibleWidgets.includes('explorer') && (
              <NexusWindowPrimitive 
                id="explorer" 
                title={t('panel.explorer')} 
                icon={<Box className="w-3 h-3 text-amber-500" />}
                defaultPos={layout.explorer || { x: 200, y: 400, width: 400, height: 300 }}
                isCollapsed={layout.explorer?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'explorer' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <ObjectExplorer />
              </NexusWindowPrimitive>
            )}

            {visibleWidgets.includes('refinery') && (
              <NexusWindowPrimitive 
                id="refinery" 
                title={t('panel.refinery')} 
                icon={<Layers className="w-3 h-3 text-cyan-400" />}
                defaultPos={layout.refinery || { x: 600, y: 200, width: 400, height: 300 }}
                isCollapsed={layout.refinery?.isCollapsed ?? false}
                onClose={closeWidget}
                onLayoutChange={updateLayout}
                onFocus={setFocusedId}
                zIndex={focusedId === 'refinery' ? 60 : 40}
                layoutMode={layoutMode}
              >
                <MedallionRefinery />
              </NexusWindowPrimitive>
            )}

            {generatedWidgets.map((w, index) => (
              <NexusWindowPrimitive
                key={w.id}
                id={w.id}
                title={w.title}
                icon={<Zap className="w-3 h-3 text-cyan-500" />}
                defaultPos={{ x: 400 + (index * 40), y: 150 + (index * 40), width: 400, height: 320 }}
                onClose={() => setGeneratedWidgets(prev => prev.filter(x => x.id !== w.id))}
              >
                <ErrorBoundary name={`Widget:${w.type}`}>
                  <div className="w-full h-full bg-black/40">
                  {w.type === 'chart' && <MetricLensChart title={w.title} />}
                  {w.type === 'detail' && <VesselDetailHub name={w.title} />}
                  {w.type === 'matrix' && <RiskMatrix />}
                  {w.type === 'legal' && <LegalIntelligenceHub />}
                  {w.type === 'threat' && <EconomicThreatRadar />}
                  {w.type === 'radar' && <MaritimeIntelligenceHub />}
                  {w.type === 'energy' && <EnergySectorLens />}
                  {w.type === 'swarm' && <SwarmOrchestrator />}
                  {w.type === 'strategic' && <StrategicReportView />}
                  {w.type === 'pipeline' && <DealPipelineHub />}
                  {w.type === 'adaptive' && <AdaptiveSwarmEngine />}
                  {w.type === 'meta' && <MetaOrchestrator />}
                  {w.type === 'validation' && <ValidationReport />}
                  {w.type === 'agent-ops' && <AgentOperationsCenter />}
                  {w.type === 'model-perf' && <ModelPerformanceMatrix />}
                  {w.type === 'cognitive' && <CognitiveOrchestrationMatrix />}
                  {w.type === 'generic' && (
                     <div className="p-6 flex flex-col items-center justify-center h-full text-center space-y-4">
                        <Brain className="w-12 h-12 text-slate-700 animate-pulse" />
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Synthetic Module Generated<br/>Waiting for Data Stream...</p>
                     </div>
                  )}
                </div>
                </ErrorBoundary>
              </NexusWindowPrimitive>
            ))}
              </div>
            </div>
          </ErrorBoundary>
        )}
      </AnimatePresence>
    </div>

          {/* SECTOR TRANSITION GUARD MODAL */}
          <AnimatePresence>
            {isSectorGuardOpen && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
              >
                <div className="w-[480px] bg-[#050505] border border-cyan-500/30 rounded-2xl p-8 shadow-[0_0_100px_rgba(6,182,212,0.15)] relative overflow-hidden">
                   {/* Animated Background Element */}
                   <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full" />
                   
                   <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="p-4 bg-cyan-950/20 border border-cyan-500/40 rounded-full mb-6 relative">
                         <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20 animate-pulse" />
                         <Globe className="w-8 h-8 text-cyan-400 relative z-10" />
                      </div>
                      
                      <h2 className="text-xl font-black tracking-[0.2em] text-white mb-2 uppercase">{t('modal.sector_guard')}</h2>
                      <p className="text-xs text-slate-400 uppercase tracking-widest mb-8 leading-relaxed">
                        {t('modal.uplink_to')} <span className="text-cyan-400 font-bold">{pendingSector}</span>.<br/>{t('modal.persistence_prompt')}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 w-full">
                         <button 
                           onClick={() => confirmSectorChange('PERSIST')}
                           className="group relative h-14 bg-slate-900 border border-slate-700 hover:border-cyan-500 transition-all rounded-xl overflow-hidden"
                         >
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
                            <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase">{t('modal.persist')}</span>
                         </button>
                         <button 
                           onClick={() => confirmSectorChange('RESET')}
                           className="group relative h-14 bg-red-950/10 border border-red-900/30 hover:border-red-500 transition-all rounded-xl overflow-hidden"
                         >
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
                            <span className="text-[10px] font-black tracking-[0.2em] text-red-500 uppercase">{t('modal.reset')}</span>
                         </button>
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-800 w-full flex justify-between items-center opacity-40">
                         <span className="text-[9px] text-slate-500 uppercase font-mono">Policy ID: TRANS-99-AX</span>
                         <span className="text-[9px] text-slate-500 uppercase font-mono">LATENCY: 12ms</span>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

    </div>
  );
}

// Icon Wrapper for the Threat Intercept to prevent hydration mismatch locally if renamed
function Terminal(props: any) {
  return <TermIcon className="w-4 h-4 text-red-500" {...props} />;
}
