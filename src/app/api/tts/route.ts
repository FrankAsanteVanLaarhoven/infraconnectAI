import { NextRequest, NextResponse } from 'next/server';

const MAX_TEXT_LENGTH = 500;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    const trimmed = text.trim();

    if (trimmed.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` },
        { status: 400 }
      );
    }

    try {
      const ZAI = await import('z-ai-web-dev-sdk').then(m => m.default);
      const zai = await ZAI.create();

      const response = await zai.audio.tts.create({
        text: trimmed,
        voice: 'alloy',
        response_format: 'mp3',
      });

      const audioBase64 = response.audio ?? response.data ?? '';

      if (!audioBase64) {
        return NextResponse.json(
          { success: false, error: 'No audio data returned from TTS service' },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        audio: audioBase64,
        format: 'mp3',
      });
    } catch (sdkError) {
      const errorMessage = sdkError instanceof Error ? sdkError.message : String(sdkError);
      return NextResponse.json({
        success: false,
        error: `TTS service unavailable: ${errorMessage}`,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
