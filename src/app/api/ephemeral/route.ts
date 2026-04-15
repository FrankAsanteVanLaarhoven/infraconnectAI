import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

const SYSTEM_PROMPT = `You are an Ephemeral UI layout generator for InfraConnectAI — an Elite-tier feature that generates custom dashboards on the fly using zero-UI principles.
You receive a natural language request from the user and respond with a strict JSON structure conforming to the EphemeralLayout interface.
Do NOT include markdown wrapping or explanation. Return ONLY JSON.

Schema:
export type EphemeralWidgetType = 'metric' | 'chart' | 'table' | 'text' | 'list';
export interface EphemeralWidget {
  id: string;
  type: EphemeralWidgetType;
  title: string;
  data: any; 
  color?: string; // e.g. "blue", "green", "red", "purple", "orange"
}
export interface EphemeralLayout {
  id: string;
  title: string;
  description?: string;
  widgets: EphemeralWidget[];
  intent: string;
  generatedAt: number;
}

Guidelines for 'data' field:
- metric: { value: string | number, change?: string }
- chart: { labels: string[], datasets: { label: string, data: number[] }[] }
- table: { columns: string[], rows: any[][] }
- list: { items: string[] }
- text: { content: string }

Generate realistic fake telemetry or data mapping to the user's intent. Give it a Palantir-style technical feel. Provide 2-5 widgets.`;

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 });

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: "application/json" } });

      const prompt = `${SYSTEM_PROMPT}\n\nUser Request: ${query}`;
      const response = await model.generateContent(prompt);
      const content = response.response.text();
      
      if (content) {
        const parsed = JSON.parse(content);
        parsed.id = parsed.id || `eui-${Date.now()}`;
        parsed.generatedAt = Date.now();
        parsed.intent = query;
        return NextResponse.json(parsed);
      }
    } catch (llmError) {
       console.error("LLM Generation failed, generating fallback schema", llmError);
    }
    
    // Fallback if LLM fails or keys are missing
    const fallbackLayout = {
      id: `eui-${Date.now()}`,
      title: "Autonomic Telemetry Focus",
      description: "Generated dynamically from intent syntax",
      intent: query,
      generatedAt: Date.now(),
      widgets: [
        {
          id: `w1`,
          type: 'metric',
          title: 'Intent Confidence',
          data: { value: '98.4%', change: '+1.2%' },
          color: 'green'
        },
        {
          id: `w2`,
          type: 'text',
          title: 'Routing Status',
          data: { content: `Dynamic routing established for requested intent: \\"${query}\\". Zero physical APIs provisioned.` },
          color: 'blue'
        }
      ]
    };
    return NextResponse.json(fallbackLayout);

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
