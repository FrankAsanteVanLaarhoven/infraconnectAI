import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET() {
  const tools = [
    { name: 'VS Code', binary: 'code', type: 'IDE' },
    { name: 'Cursor', binary: 'cursor', type: 'IDE' },
    { name: 'Claude Code', binary: 'claude', type: 'AGENT' },
    { name: 'Antigravity', binary: 'antigravity', type: 'AGENT' },
    { name: 'Ollama', binary: 'ollama', type: 'LLM_ENGINE' },
  ];

  const results = await Promise.all(
    tools.map(async (tool) => {
      try {
        // Search in common PATH and Application folder on Mac
        const { stdout } = await execPromise(`which ${tool.binary} || ls /Applications | grep -i "${tool.name.replace(' ', '')}"`);
        return { ...tool, detected: !!stdout.trim(), location: stdout.trim() };
      } catch {
        return { ...tool, detected: false, location: null };
      }
    })
  );

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: {
      os: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
    },
    detectedTools: results,
    status: results.some(r => r.detected) ? 'ACTIVE_WORKSPACE_DETECTED' : 'GENERIC_OPERATOR_MODE',
    plan: 'Observe. Decide. Act.'
  });
}
