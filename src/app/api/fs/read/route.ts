import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // In a real app, you should validate that filePath is within allowed directories
    // For this local sandbox, we allow reading from the absolute path provided by the Explorer tree
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('[FS_API_READ] Error reading file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
