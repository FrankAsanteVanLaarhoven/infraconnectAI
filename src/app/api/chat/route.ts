import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, modelId } = await req.json();

    if (!process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Google API key is missing from environment variables.' }, { status: 500 });
    }

    // Map the user's requested strings to valid 2026 API model IDs from their account
    let mappedModelId = 'gemini-pro-latest';
    
    switch (modelId) {
      case 'gemini-3.1-pro':
      case 'Gemini 3.1 Pro':
        mappedModelId = 'gemini-3.1-pro-preview';
        break;
      case 'gemini-3.0':
      case 'Gemini 3.0':
        mappedModelId = 'gemini-3-pro-preview'; 
        break;
      case 'gemini-3.1-flash':
      case 'Gemini 3.1 Flash':
        mappedModelId = 'gemini-3-flash-preview';
        break;
      case 'gemini-veo-3.0':
      case 'Gemini Veo 3.0':
        // Fallback to pro-latest for text chats, since Veo is video generation
        mappedModelId = 'gemini-pro-latest';
        break;
      default:
        mappedModelId = modelId || 'gemini-pro-latest';
        break;
    }

    const cleanModelId = mappedModelId.replace('models/', '');

    const result = await streamText({
      model: google(cleanModelId),
      messages,
      system: `You are the Sovereign Copilot, an advanced AI embedded in the InfraConnect Platform. 
      You act as a SOTA mission control companion. You assist the operator with generating ROS 2 scripts, 
      explaining infrastructure metrics, and providing command-line guidance. Keep responses concise, 
      cyberpunk-styled when appropriate, and always format code blocks clearly.`,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('[AI_GATEWAY] Error processing Copilot chat request:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request.' }, { status: 500 });
  }
}
