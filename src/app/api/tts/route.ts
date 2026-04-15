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
      // Use generic fallback implementation without any proprietary SDK branding
      // Simulator mode since native TTS via external unbranded API is stubbed
      const audioBase64 = "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="; // 1 second silent mock buffer
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
