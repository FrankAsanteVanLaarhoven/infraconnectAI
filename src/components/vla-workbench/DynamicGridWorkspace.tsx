'use client';

import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useVlaWorkbenchStore, PanelConfig } from '@/stores/vlaWorkbenchStore';
import { X, GripHorizontal } from 'lucide-react';

// Import all panels
import { OverviewPanel } from './OverviewPanel';
import { EpisodeGrid } from './EpisodeGrid';
import { AnalyticsPanel } from './AnalyticsPanel';
import { EnginesPanel } from './EnginesPanel';
import { ROS2TelemetryDashboard } from './ROS2TelemetryDashboard';
import { RVizWebViewer } from './RVizWebViewer';
import { LiveCurationPanel } from './LiveCurationPanel';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function DynamicGridWorkspace() {
  const { activePanels, gridLayouts, updateGridLayouts, removePanel, setEpisodeModalOpen, selectEpisode, currentRunId } = useVlaWorkbenchStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onLayoutChange = (currentLayout: Layout, allLayouts: any) => {
    updateGridLayouts(currentLayout as any);
  };

  const renderPanelContent = (panel: PanelConfig) => {
    switch (panel.type) {
      case 'overview': return <OverviewPanel />;
      case 'episodes': return <EpisodeGrid onEpisodeClick={(ep: any) => { selectEpisode(ep); setEpisodeModalOpen(true); }} />;
      case 'analytics': return <AnalyticsPanel />;
      case 'engines': return <EnginesPanel />;
      case 'ros2': return <ROS2TelemetryDashboard />;
      case 'rviz': return <RVizWebViewer />;
      case 'curation': return <LiveCurationPanel runId={currentRunId} />;
      default: return <div className="p-4 text-zinc-500 font-mono text-xs">Unknown panel type</div>;
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden bg-[#0a0a0a]/50">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: gridLayouts }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
        margin={[16, 16]}
      >
        {activePanels.map((panel) => (
          <div 
            key={panel.id} 
            className="flex flex-col border border-zinc-800/80 bg-black rounded-lg overflow-hidden shadow-2xl relative group"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="drag-handle cursor-move p-1 text-zinc-600 hover:text-white transition-colors" title="Drag to move panel">
                  <GripHorizontal className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-zinc-300 tracking-widest uppercase">{panel.title}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => removePanel(panel.id)}
                  className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                  title="Close panel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            {/* Panel Content */}
            <div className="flex-1 overflow-auto custom-scrollbar p-2 bg-[#050505]">
              {renderPanelContent(panel)}
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
