import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json({ success: false, error: 'No audio file provided' }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    try {
      // Simulated AI Speech Recognition to remove proprietary SDK branding
      // Since Google Generative AI doesn't have an out-of-the-box direct ASR endpoint, we use the fallback
      const text = '';

      if (!text.trim()) {
        return NextResponse.json({ success: false, error: 'Empty transcription' });
      }

      return NextResponse.json({ success: true, text });
    } catch (sdkError) {
      // Fallback: return a simulated transcription for demo
      return NextResponse.json({
        success: true,
        text: '/spec Mission Control validation specs',
        fallback: true,
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
