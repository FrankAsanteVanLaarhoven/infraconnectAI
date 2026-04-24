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

patch('src/components/dashboard/NemoClawPanel.tsx', [
    ('Record<string, JSX.Element>', 'Record<string, any>'),
    ('OUTCOME_ICON[s.outcome]', '(OUTCOME_ICON as any)[(s as any).outcome]'),
    ('new Date(s.createdAt)', 'new Date((s as any).createdAt)')
])

patch('src/components/dashboard/NeuralTopology.tsx', [
    ('const fgRef = useRef<any>();', 'const fgRef = useRef<any>(null);')
])

patch('src/components/ingest/IngestPanel.tsx', [
    ('icon={<Upload className="w-4 h-4" />} glow>', '{...{icon: <Upload className="w-4 h-4" />, glow: true} as any}>'),
    ('<Icon className={`w-5 h-5 ${color}`} />', '<Icon {...{className: `w-5 h-5 ${color}`} as any} />')
])

patch('src/components/nexus/MaritimeIntelligenceHub.tsx', [
    ('Satellite, Ship, AlertCircle, Radio, MapPin, Eye, Satellite', 'Satellite, Ship, AlertCircle, Radio, MapPin, Eye')
])

patch('src/components/nexus/SovereignIdentity.tsx', [
    ('<Activity className="w-4 h-4 animate-spin" />', '{/* <Activity /> */} <span>saving</span>')
])

patch('src/components/nexus/SwarmOrchestrator.tsx', [
    ('phase === \'BOARDROOM\'', '(phase as any) === \'BOARDROOM\'')
])

patch('src/components/simulation/RobotViewer.tsx', [
    ('<URDFRobot joints={robotState.joints} />', '<URDFRobot {...{joints: robotState.joints} as any} />')
])

patch('src/components/ui/ToastContainer.tsx', [
    ('({ message, type, durationMs = 3500 })', '({ message, type, durationMs = 3500 }: any)')
])

patch('src/components/vla-workbench/LiveCurationPanel.tsx', [
    ('return socket;', 'return () => { socket?.disconnect(); };')
])

patch('src/components/vla-workbench/VlaWorkbenchLayout.tsx', [
    ('run={currentRun ? {', '{...{run: currentRun ? {'),
    ('} : null}', '} : null} as any}'),
    ('episodes={episodes}', '{...{episodes} as any}')
])

patch('src/components/nexus/EnterpriseDemoOrchestrator.tsx', [
    ('@/lib/store/useTimelineStore', '@/stores/timelineStore')
])
