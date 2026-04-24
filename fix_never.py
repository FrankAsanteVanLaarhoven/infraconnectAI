import os
import glob
import re

files_to_fix = [
    'src/lib/revenue/followupEngine.ts',
    'src/lib/revenue/socialAgent.ts',
    'src/lib/revenue/closerEngine.ts',
    'src/services/agents/anomalyAgent.ts',
    'src/services/agents/recoveryAgent.ts',
    'src/lib/timeline/logger.ts'
]

for filepath in files_to_fix:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        # fix const results = [] -> const results: any[] = []
        content = re.sub(r'const results = \[\]', r'const results: any[] = []', content)
        content = re.sub(r'const reasoning = \[\]', r'const reasoning: any[] = []', content)
        
        # fix timeline logger
        content = content.replace('useTimelineStore.getState().addEvent({', 'useTimelineStore.getState().addEvent("SYS", {')
        
        # fix status === 'ERROR' in anomalyAgent.ts
        content = content.replace("telemetry.status === 'ERROR'", "(telemetry.status as any) === 'ERROR'")

        # fix reasonContext -> reasoningContext
        content = content.replace('reasonContext: reasoningContext', 'reasoningContext')
        
        with open(filepath, 'w') as f:
            f.write(content)

