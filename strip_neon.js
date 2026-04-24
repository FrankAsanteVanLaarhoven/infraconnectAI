const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Regex patterns to replace
const replacements = [
  // Remove purple backgrounds
  { regex: /bg-purple-\d+(?:\/\d+)?/g, replacement: 'bg-slate-900/50' },
  // Remove purple text
  { regex: /text-purple-\d+(?:\/\d+)?/g, replacement: 'text-slate-400' },
  // Remove purple borders
  { regex: /border-purple-\d+(?:\/\d+)?/g, replacement: 'border-slate-800' },
  
  // Remove matrix green glowing texts/borders
  { regex: /text-green-\d+(?:\/\d+)?/g, replacement: 'text-slate-300' },
  { regex: /bg-green-\d+(?:\/\d+)?/g, replacement: 'bg-slate-800' },
  { regex: /border-green-\d+(?:\/\d+)?/g, replacement: 'border-slate-700' },

  // Remove emerald 
  { regex: /text-emerald-\d+(?:\/\d+)?/g, replacement: 'text-slate-300' },
  { regex: /bg-emerald-\d+(?:\/\d+)?/g, replacement: 'bg-slate-800' },
  { regex: /border-emerald-\d+(?:\/\d+)?/g, replacement: 'border-slate-700' },

  // Replace matrix-specific bespoke colors with slate equivalents
  { regex: /text-\[\#10b981\]/g, replacement: 'text-slate-300' },
  { regex: /text-\[\#059669\]/g, replacement: 'text-slate-400' },
  { regex: /bg-\[\#10b981\](?:\/\d+)?/g, replacement: 'bg-slate-800' },

  // Strip arbitrary glowing box shadows
  { regex: /shadow-\[0_0_[^\]]+rgba[^\]]+\]/g, replacement: '' },
  { regex: /shadow-\[0_0_[^\]]+#\w+[^\]]*\]/g, replacement: '' },

  // Flatten rounded corners to Palantir/Tesla sharp/slight radius
  { regex: /rounded-2xl/g, replacement: 'rounded-none' },
  { regex: /rounded-xl/g, replacement: 'rounded-sm' },
  { regex: /rounded-lg/g, replacement: 'rounded-sm' },
  { regex: /rounded-full/g, replacement: 'rounded-sm' }, // Note: may break some icons, but Palantir uses square icons

  // Remove custom animations
  { regex: /animate-pulse-glow/g, replacement: '' },
  { regex: /animate-pulse/g, replacement: '' }, // Often used for glowing dots
  { regex: /animate-breathe/g, replacement: '' },
  
  // Convert glowing dots to flat square dots
  { regex: /w-2 h-2 rounded-full bg-slate-300/g, replacement: 'w-1.5 h-1.5 bg-slate-400' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }
      
      // Additional cleanup: remove multiple spaces created by replacements
      if (modified) {
        content = content.replace(/className="([^"]*)"/g, (match, p1) => {
          return `className="${p1.replace(/\s+/g, ' ').trim()}"`;
        });
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Mass replacement complete.');
