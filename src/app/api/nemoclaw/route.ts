import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { updateAllProjections } from '@/lib/memory/projections';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface NemoClawRequest {
  actionId: string;
  toolSet: string[]; // e.g., ["bash", "docker", "robot_primitive"]
  payload: {
    command?: string;
    script?: string;
    endpoint?: string;
    [key: string]: any;
  };
  securityClearance: 'L0' | 'L1' | 'L2';
}

export interface NemoClawResponse {
  permit: boolean;
  policyViolations: string[];
  executionTrace: any;
  recoveryInvoked: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const reqBody: NemoClawRequest = await request.json();
    const { actionId, toolSet, payload, securityClearance } = reqBody;

    if (!toolSet || !Array.isArray(toolSet)) {
      return NextResponse.json({ error: 'toolSet array required' }, { status: 400 });
    }

    // 1. Governance Plane Policy Intercept
    // Fetch active L2 Canon nodes to enforce guardrails
    const canonNodes = await db.memoryNode.findMany({
      where: {
        level: 'L2',
        state: 'canonical'
      }
    });

    const violations: string[] = [];

    // Analyze tool constraints vs L2 logic
    // (This acts as the robust logic engine bridging Memory <-> Execution Planes)
    const activeCommand = payload.command || payload.script || '';
    
    // Strict blocklists based on production L2 safeguards
    if (activeCommand) {
      if (activeCommand.includes('rm -rf') || activeCommand.includes('sudo ')) {
        violations.push('L2-Violation-40B: Destructive system traversal blocked.');
      }
      if (activeCommand.includes('/etc/') || activeCommand.includes('~/.ssh')) {
        violations.push('L2-Violation-41A: Path access outside working directory bounded.');
      }
    }

    // If clearance is untrusted (L0), be extremely restrictive about tools
    if (securityClearance === 'L0' && (toolSet.includes('docker') || toolSet.includes('bash'))) {
        violations.push('L2-Violation-12C: Untrusted L0 state cannot invoke shell/container APIs.');
    }

    // Combine Canon Node metadata (Mock semantic check against canon topics)
    const canonContext = canonNodes.map(n => (n.summary || '').toLowerCase()).join(' ');
    if (activeCommand && canonContext.includes('freeze') && activeCommand.includes('deploy')) {
        violations.push('L2-Violation-09F: Global code freeze policy active in L2 memory.');
    }

    // 2. Execution Decision Gate
    const decision = violations.length > 0 ? 'deny' : 'permit';
    
    const interceptId = `int_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Log RuntimeIntercept to DB
    await db.runtimeIntercept.create({
      data: {
        shortId: interceptId,
        actorId: 'nemoclaw_system',
        policyProfile: securityClearance,
        action: 'execute_command',
        target: toolSet.join(','),
        decision: decision,
        reason: violations.length > 0 ? violations.join(' | ') : 'Passed all L2 checks.',
        executed: decision === 'permit',
      }
    });

    // Also emit a DomainEvent
    const eventRecord = await db.domainEvent.create({
      data: {
        eventType: 'runtime.intercepted',
        aggregateType: 'policy',
        aggregateId: interceptId,
        actorId: 'nemoclaw_system',
        payload: {
          actionId,
          toolSet,
          decision,
          violations
        }
      }
    });

    await updateAllProjections(eventRecord);

    if (violations.length > 0) {
      // Activity Log entry for Security Audit
      await db.agentIncident.create({
        data: {
          agentId: 'nemoclaw_system',
          severity: 'QUARANTINED',
          category: 'SECURITY',
          description: `NemoClaw blocked payload. Violations: ${violations.length}`,
        },
      });

      return NextResponse.json({
        permit: false,
        policyViolations: violations,
        executionTrace: null,
        recoveryInvoked: false
      } as NemoClawResponse);
    }

    // 3. Permitted Execution Runtime
    let executionOutput: any = { status: 'mock_executed', message: 'No executable payload provided.' };
    let recoveryInvoked = false;

    if (activeCommand && toolSet.includes('bash')) {
        try {
            // Execute with an aggressive timeout for safety in the sandbox
            const { stdout, stderr } = await execAsync(activeCommand, { timeout: 10000 });
            executionOutput = {
                status: 'success',
                stdout: stdout.trim(),
                stderr: stderr.trim()
            };
        } catch (execError: any) {
            // Execution failed organically (compile error, timeout)
            executionOutput = {
                status: 'error',
                message: execError.message,
                code: execError.code
            };
            
            // Auto-recovery trigger for Industrial Standard validation
            recoveryInvoked = true;
            violations.push('Runtime execution failure detected. Handing state to recovery system.');
        }
    } else if (toolSet.includes('robot_primitive')) {
       // Mock robot API execution
       executionOutput = {
         status: 'success',
         telemetry: { joint1: 0.5, joint2: -1.2, grip: 'locked' },
         latency_ms: 124
       };
    }

    // Auditing the successful execution
    await db.agentIncident.create({
        data: {
          agentId: 'nemoclaw_system',
          severity: 'INFO',
          category: 'AUDIT',
          description: `NemoClaw executed [${toolSet.join(',')}] within L2 policy bounds.`,
        },
    });

    return NextResponse.json({
      permit: violations.length === 0,
      policyViolations: violations,
      executionTrace: executionOutput,
      recoveryInvoked: recoveryInvoked
    } as NemoClawResponse);

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
