import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, modelId } = await req.json();

    if (!process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Google API key is missing from environment variables.' }, { status: 500 });
    }

    // Default to gemini-1.5-pro-latest if none provided, but map the user's requested strings to valid API model IDs
    let mappedModelId = 'gemini-1.5-pro-latest';
    
    switch (modelId) {
      case 'gemini-3.1-pro':
      case 'gemini-1.5-pro-latest':
      case 'Gemini 3.1 Pro':
        mappedModelId = 'models/gemini-1.5-pro-latest'; // Future-proofing to the closest existing model
        break;
      case 'gemini-3.0':
      case 'Gemini 3.0':
        mappedModelId = 'models/gemini-1.5-pro'; 
        break;
      case 'gemini-3.1-flash':
      case 'Gemini 3.1 Flash':
        mappedModelId = 'models/gemini-1.5-flash-latest';
        break;
      case 'gemini-veo-3.0':
      case 'Gemini Veo 3.0':
        // Veo is a video model, fallback to 1.5-pro for text generation chat
        mappedModelId = 'models/gemini-1.5-pro-latest';
        break;
      default:
        // Attempt to pass whatever string they sent directly to Google if it's not in our map
        mappedModelId = modelId || 'models/gemini-1.5-pro-latest';
        break;
    }

    // Google Generative AI requires 'models/' prefix sometimes depending on the SDK version, 
    // but @ai-sdk/google natively accepts standard strings like 'gemini-1.5-pro-latest'
    // Let's clean the string for the @ai-sdk wrapper
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
