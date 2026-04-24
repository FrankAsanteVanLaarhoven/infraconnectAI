import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { filePath, content } = await req.json();

    if (!filePath) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // In a real app, validate path bounds here
    fs.writeFileSync(filePath, content, 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[FS_API_WRITE] Error writing file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
