import { aStar, CostMap, Point } from "../planning/astar";

export type ConstraintType = "battery" | "zone" | "collision" | "time";

export type Constraint = {
  type: ConstraintType;
  value: any;
};

export type MissionStep = {
  id: string;
  action: string;
  target?: string;
  expectedDuration?: number;
  path?: Point[];
};

export type Mission = {
  goal: string;
  constraints: Constraint[];
  steps: MissionStep[];
};

export type RobotState = {
  battery: number;
  zone: string;
  status: "idle" | "moving" | "inspecting" | "error";
  position: [number, number, number];
};

/**
 * Validates a single mission step against current state and constraints.
 */
export function validateStep(step: MissionStep, state: RobotState, constraints: Constraint[]): { valid: boolean; reason?: string } {
  for (const constraint of constraints) {
    if (constraint.type === "battery") {
      const minBattery = parseInt((constraint.value as string).replace(/\D/g, ""), 10);
      if (state.battery < minBattery) {
        return { valid: false, reason: `Battery constraint failed. Current: ${state.battery}%, Required: >${minBattery}%` };
      }
    }
    if (constraint.type === "zone") {
      const restrictedZones = (constraint.value as string).split(",").map(z => z.trim());
      if (restrictedZones.includes(state.zone)) {
        return { valid: false, reason: `Zone constraint failed. Currently inside restricted zone ${state.zone}` };
      }
    }
    if (constraint.type === "collision") {
      if (state.status === "error") {
        return { valid: false, reason: "Collision hazard detected." };
      }
    }
  }

  return { valid: true };
}

/**
 * Generates dynamic physical cost map from mission constraints
 */
function buildCostMap(constraints: Constraint[]): CostMap {
  const restrictedZones = constraints
    .filter(c => c.type === "zone")
    .map(c => (c.value as string).split(",").map(v => v.trim()))
    .flat();
    
  return {
    width: 100, 
    height: 100,
    isRestricted: (p: Point) => {
       // Mock: let arbitrary regions equal forbidden zones based on constraint value
       if (restrictedZones.includes("A") && p.x > 70 && p.y < 30) return true;
       if (restrictedZones.includes("B") && p.x > 30 && p.x < 50 && p.y > 60) return true;
       return false;
    },
    getCost: (p: Point) => {
       return 1; // Base cost 1
    }
  };
}

/**
 * Mock LLM planner for Phase 1.
 * Translates natural language goal into execution steps.
 */
export async function planMission(goal: string, constraints: Constraint[]): Promise<Mission> {
  // Simulate LLM delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Determine steps based on goal
  let steps: MissionStep[] = [];
  
  if (goal.toLowerCase().includes("inspect warehouse")) {
    steps = [
      { id: "step-1", action: "NAVIGATE", target: "warehouse-A-entrance", expectedDuration: 2000 },
      { id: "step-2", action: "ENTER_ZONE", target: "warehouse-A", expectedDuration: 1000 },
      { id: "step-3", action: "SCAN", target: "aisle-1", expectedDuration: 3000 },
      { id: "step-4", action: "REPORT", target: "hq", expectedDuration: 500 }
    ];
  } else {
    // Generic fallback mission
    steps = [
      { id: "step-1", action: "INITIALIZE", expectedDuration: 1000 },
      { id: "step-2", action: "MOVE_TO_TARGET", target: "sector-7g", expectedDuration: 3000 },
    ];
  }

  steps = steps.map(s => {
      // Inject physical A* routing paths natively into the payload for execution
      if (s.action === "NAVIGATE" || s.action === "MOVE_TO_TARGET") {
          const gridMap = buildCostMap(constraints);
          // Assuming origin 0,0 and arbitrary goal 80,80 for mock purposes
          const computedPath = aStar(gridMap, {x:0, y:0}, {x:80, y:80});
          s.path = computedPath;
      }
      return s;
  });

  return {
    goal,
    constraints,
    steps
  };
}

/**
 * Mission Agent Loop Engine.
 * Handles the async execution of a mission payload safely.
 */
export class AgentEngine {
  private currentState: RobotState;
  public logBuffer: string[] = [];
  private onStateChange: (state: RobotState) => void;
  private onLog: (msg: string, type: 'info'|'warning'|'error'|'success') => void;
  private onCommandStream: (command: any) => void;
  
  constructor(initialState: RobotState, onStateChange: (state: RobotState) => void, onLog: (msg: string, type: 'info'|'warning'|'error'|'success') => void, onCommandStream: (command: any) => void = () => {}) {
    this.currentState = initialState;
    this.onStateChange = onStateChange;
    this.onLog = onLog;
    this.onCommandStream = onCommandStream;
  }

  private emitState() {
    this.onStateChange({...this.currentState});
  }

  private emitLog(msg: string, type: 'info'|'warning'|'error'|'success' = 'info') {
    this.onLog(msg, type);
  }

  public async executeStep(step: MissionStep) {
    this.emitLog(`Executing: ${step.action} -> ${step.target || ''}`, 'info');
    
    // Simulate robot work
    this.currentState.status = "moving";
    this.emitState();
    
    // Bind generated A* path constraints down physical Kafka sockets
    if (step.path && step.path.length > 0) {
        this.onCommandStream({
            robot_id: "humanoid-01",
            action: "path_override",
            path: step.path
        });
    }

    await new Promise((resolve) => setTimeout(resolve, step.expectedDuration || 1000));
    
    // Impact state mock
    this.currentState.battery -= 1; 
    if (step.action === "ENTER_ZONE" && step.target) {
      this.currentState.zone = step.target;
    }
    
    this.currentState.status = "idle";
    this.emitState();
    this.emitLog(`Completed: ${step.action}`, 'success');
  }

  public async runMission(mission: Mission) {
    this.emitLog(`Starting Mission: ${mission.goal}`, 'warning');
    
    for (const step of mission.steps) {
      const validation = validateStep(step, this.currentState, mission.constraints);
      if (!validation.valid) {
        this.emitLog(`Constraint Violation: ${validation.reason}`, 'error');
        this.emitLog('Triggering Replanning...', 'warning');
        
        // Trigger Replan
        this.currentState.status = "error";
        this.emitState();
        break; // Stop execution
      }

      await this.executeStep(step);
    }
    
    if (this.currentState.status !== "error") {
      this.emitLog(`Mission Accomplished: ${mission.goal}`, 'success');
    }
  }
}
