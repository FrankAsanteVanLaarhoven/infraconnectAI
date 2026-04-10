import { NextRequest, NextResponse } from 'next/server';

type ActionType = 'open_panel' | 'run_skill' | 'search' | 'create_node' | 'promote' | 'navigate' | 'unknown';
type PanelType = 'overview' | 'health' | 'skills' | 'explorer' | 'governance' | 'search' | 'activity' | 'agentbus';
type SkillType = 'spec' | 'plan' | 'build' | 'test' | 'review' | 'ship';

interface IntentResult {
  action: ActionType;
  panel?: PanelType;
  skill?: SkillType;
  query?: string;
  params?: Record<string, string>;
  display: string;
}

const SYSTEM_PROMPT = `You are an Intent Parser for MEMDEVOS — a Memory DevOps Platform for VLA autonomous systems development.

Parse the user's natural language into ONE structured action. Return ONLY valid JSON, no explanation.

Actions: open_panel | run_skill | search | create_node | promote | navigate | unknown
Panels: overview | health | skills | explorer | governance | search | activity | agentbus
Skills: spec | plan | build | test | review | ship

Rules:
- "open/show <panel>" → open_panel with panel field
- "/<skill> ..." → run_skill with skill field, query = rest
- "find/search/look for ..." → search with query field
- "promote/upgrade ..." → promote with optional params
- Navigate phrases → navigate with panel
- Anything else → unknown
- Display is a short confirmation message.

Respond with JSON: { "action": "...", "panel": "...", "skill": "...", "query": "...", "params": {}, "display": "..." }`;

function keywordFallback(text: string): IntentResult {
  const lower = text.toLowerCase().trim();
  const panels: Record<string, PanelType> = {
    overview: 'overview', dashboard: 'overview', home: 'overview',
    health: 'health', status: 'health', metrics: 'health',
    skills: 'skills', pipeline: 'skills', lifecycle: 'skills',
    explorer: 'explorer', memory: 'explorer', nodes: 'explorer', browse: 'explorer',
    governance: 'governance', policy: 'governance', rules: 'governance',
    search: 'search', find: 'search',
    activity: 'activity', log: 'activity', events: 'activity', history: 'activity',
    agentbus: 'agentbus', 'agent bus': 'agentbus', bus: 'agentbus', agents: 'agentbus',
  };

  const skills: Record<string, SkillType> = {
    spec: 'spec', specify: 'spec', specification: 'spec',
    plan: 'plan', planning: 'plan',
    build: 'build', construct: 'build', implement: 'build',
    test: 'test', testing: 'test', validate: 'test',
    review: 'review', audit: 'review', inspect: 'review',
    ship: 'ship', deploy: 'ship', release: 'ship', publish: 'ship',
  };

  const promoteWords = ['promote', 'upgrade', 'elevate', 'advance', 'promot'];

  // Slash command: /skill args
  const slashMatch = lower.match(/^\/(\w+)\s*(.*)/);
  if (slashMatch) {
    const skillName = slashMatch[1];
    const skill = skills[skillName] as SkillType | undefined;
    if (skill) {
      return {
        action: 'run_skill',
        skill,
        query: slashMatch[2].trim() || undefined,
        display: `Running /${skill}${slashMatch[2].trim() ? `: ${slashMatch[2].trim()}` : ''}`,
      };
    }
  }

  // Promote
  if (promoteWords.some(w => lower.includes(w))) {
    const query = lower.replace(new RegExp(promoteWords.join('|'), 'g'), '').trim();
    return {
      action: 'promote',
      query: query || undefined,
      display: `Promoting memory node${query ? `: ${query}` : ''}`,
    };
  }

  // Open panel
  const openWords = ['open', 'show', 'go to', 'navigate', 'view', 'display', 'switch to', 'take me to'];
  if (openWords.some(w => lower.includes(w))) {
    for (const [keyword, panel] of Object.entries(panels)) {
      if (lower.includes(keyword)) {
        return {
          action: 'open_panel',
          panel,
          display: `Opening ${panel} panel`,
        };
      }
    }
  }

  // Search
  const searchWords = ['search', 'find', 'look for', 'look up', 'where is', 'locate', 'query'];
  if (searchWords.some(w => lower.includes(w))) {
    const query = lower.replace(new RegExp(searchWords.join('|'), 'g'), '').trim();
    return {
      action: 'search',
      query: query || lower,
      display: `Searching for "${query || lower}"`,
    };
  }

  // Direct panel name
  for (const [keyword, panel] of Object.entries(panels)) {
    if (lower === keyword || lower === `show ${keyword}`) {
      return {
        action: 'open_panel',
        panel,
        display: `Opening ${panel} panel`,
      };
    }
  }

  // Direct skill name
  for (const [keyword, skill] of Object.entries(skills)) {
    if (lower === keyword || lower.startsWith(`${keyword} `)) {
      const query = lower.replace(new RegExp(`^${keyword}\\s*`), '').trim();
      return {
        action: 'run_skill',
        skill,
        query: query || undefined,
        display: `Running /${skill}${query ? `: ${query}` : ''}`,
      };
    }
  }

  return {
    action: 'unknown',
    display: `I'm not sure what you mean by "${text.trim()}"`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const trimmed = text.trim();

    // Try LLM-based intent parsing
    try {
      const ZAI = await import('z-ai-web-dev-sdk').then(m => m.default);
      const zai = await ZAI.create();

      const response = await zai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: trimmed },
        ],
        temperature: 0,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      });

      const content = response.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        const validActions: ActionType[] = ['open_panel', 'run_skill', 'search', 'create_node', 'promote', 'navigate', 'unknown'];
        const validPanels: PanelType[] = ['overview', 'health', 'skills', 'explorer', 'governance', 'search', 'activity', 'agentbus'];
        const validSkills: SkillType[] = ['spec', 'plan', 'build', 'test', 'review', 'ship'];

        const result: IntentResult = {
          action: validActions.includes(parsed.action) ? parsed.action : 'unknown',
          display: parsed.display || `Intent: ${parsed.action || 'unknown'}`,
        };

        if (parsed.panel && validPanels.includes(parsed.panel)) {
          result.panel = parsed.panel as PanelType;
        }
        if (parsed.skill && validSkills.includes(parsed.skill)) {
          result.skill = parsed.skill as SkillType;
        }
        if (parsed.query) {
          result.query = String(parsed.query);
        }
        if (parsed.params && typeof parsed.params === 'object') {
          result.params = parsed.params as Record<string, string>;
        }

        return NextResponse.json(result);
      }
    } catch {
      // LLM failed, fall through to keyword matching
    }

    // Fallback: keyword-based intent parsing
    const result = keywordFallback(trimmed);
    return NextResponse.json({ ...result, fallback: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
