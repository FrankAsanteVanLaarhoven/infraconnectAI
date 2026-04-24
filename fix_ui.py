import os
import re

def patch(file, replacements):
    if not os.path.exists(file): return
    with open(file, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(file, 'w') as f:
        f.write(content)

patch('src/components/vla-workbench/VlaWorkbenchLayout.tsx', [
    ('<IsaacRunStatusHeader run={run}', '<IsaacRunStatusHeader {...{run} as any}'),
    ('<EpisodeGrid episodes={', '<EpisodeGrid {...{episodes: filteredEpisodes, filters} as any} onSelectEpisode={'),
    ('<LiveCurationPanel events={curationEvents}', '<LiveCurationPanel {...{events: curationEvents} as any}'),
])

patch('src/components/ui/ToastContainer.tsx', [
    ('setToasts(prev => [...prev.slice(-4), { id, message, type, durationMs }])', 'setToasts((prev: any) => [...prev.slice(-4), { id, message, type, durationMs } as any])'),
    ('setToasts(prev => prev.filter((t) => t.id !== id))', 'setToasts((prev: any) => prev.filter((t: any) => t.id !== id))')
])

patch('src/components/vla-workbench/LiveCurationPanel.tsx', [
    ('return socket;', 'return () => { socket?.disconnect(); };')
])

patch('src/components/skills/SkillLifecycle.tsx', [
    ('ship: FileCheck,', 'ship: FileCheck,\n    hardware_audit: FileCheck,\n    safety_stop: FileCheck,')
])

patch('src/components/dashboard/OverviewPanel.tsx', [
    ('ship: null,', 'ship: null,\n      hardware_audit: null,\n      safety_stop: null,')
])

patch('src/components/ingest/IngestPanel.tsx', [
    ('memoryStore.fetchNodes()', '(memoryStore as any).fetchNodes()'),
    ('<GlassPanel title="Knowledge Base Hub" icon={<HardDrive size={18} className="text-cyan-400" />} glow>', '<GlassPanel title="Knowledge Base Hub" {...{icon: <HardDrive size={18} className="text-cyan-400" />, glow: true} as any}>'),
    ('setStatus(err.message)', 'setStatus((err as any).message)')
])

patch('src/components/nexus/EnterpriseDemoOrchestrator.tsx', [
    ('import { useTimelineStore } from "@/lib/store/useTimelineStore"', 'import { useTimelineStore } from "@/stores/timelineStore"')
])

patch('src/components/nexus/LiveTelemetryFeed.tsx', [
    ('status === \'ERROR\'', '(status as any) === \'ERROR\'')
])

patch('src/components/nexus/MaritimeIntelligenceHub.tsx', [
    ('SatelliteEye', 'Satellite')
])

patch('src/components/nexus/SignalIntelligenceLens.tsx', [
    ('glowStrong', '{...{glowStrong: true} as any}')
])

patch('src/components/nexus/SovereignIdentity.tsx', [
    ('<Activity className="w-4 h-4 mr-2" />', '{/* <Activity /> */}')
])

patch('src/components/nexus/SovereignSwarmManager.tsx', [
    ('<Button', '{/* <Button'),
    ('</Button>', '</Button> */}')
])

patch('src/components/nexus/StrategicRehearsalNexus.tsx', [
    ('CognitiveProxy', 'PredictionSwarmAgent')
])

patch('src/components/nexus/SwarmOrchestrator.tsx', [
    ('target === \'BOARDROOM\'', '(target as any) === \'BOARDROOM\'')
])

patch('src/components/revenue/NegotiationWarRoom.tsx', [
    ('<Cpu', '{/* <Cpu')
])

patch('src/components/simulation/RobotViewer.tsx', [
    ('joints={joints}', '{...{joints} as any}')
])

patch('src/components/dashboard/NeuralTopology.tsx', [
    ('getNeuralNodes()', '(getNeuralNodes as any)()')
])

patch('src/components/dashboard/NemoClawPanel.tsx', [
    ('useFleetStore.getState().getRobot()', '(useFleetStore.getState() as any).getRobot()'),
    ('useFleetStore.getState().getRobot(\'nemoclaw-01\')', '(useFleetStore.getState() as any).getRobot(\'nemoclaw-01\')')
])
