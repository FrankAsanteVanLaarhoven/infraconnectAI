type Agent = {
  name: string;
  trigger: (event: any) => boolean;
  run: (event: any) => Promise<void> | void;
};

const agents: Agent[] = [];

/**
 * Global standardized hook enforcing identical parameter layouts natively resolving disparate arrays.
 */
export function register(agent: Agent) {
  agents.push(agent);
}

/**
 * The pure execution routing function mapping native inputs explicitly dynamically scaling triggers.
 */
export async function runAgents(event: any) {
  for (const agent of agents) {
    if (agent.trigger(event)) {
      await agent.run(event);
    }
  }
}
