import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getDirectoryTree(dirPath: string, depth = 0, maxDepth = 3): any[] {
  if (depth > maxDepth) return [];
  
  try {
    const items = fs.readdirSync(dirPath);
    const tree: any[] = [];
    
    for (const item of items) {
      if (['node_modules', '.next', '.git', 'dist'].includes(item)) continue;
      
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        tree.push({
          name: item,
          type: 'directory',
          path: fullPath,
          children: getDirectoryTree(fullPath, depth + 1, maxDepth)
        });
      } else {
        tree.push({
          name: item,
          type: 'file',
          path: fullPath,
          size: stat.size
        });
      }
    }
    
    // Sort directories first, then files
    return tree.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'directory' ? -1 : 1;
    });
  } catch (err) {
    console.error(`[FS_API] Error reading directory ${dirPath}:`, err);
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const rootPath = process.cwd();
    const tree = getDirectoryTree(rootPath);
    return NextResponse.json({ tree, root: rootPath });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
