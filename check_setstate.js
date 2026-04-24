const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        // Look for setSomething( without being inside a callback
        // This is a naive regex, but let's see if we spot anything obvious
        if (line.match(/set[A-Z][a-zA-Z]*\(/) && !line.includes('=>') && !line.includes('function') && !line.includes('onClick') && !line.includes('onChange') && !line.includes('useEffect') && !line.includes('useCallback') && !line.includes('subscribe')) {
            console.log(`${file}:${i+1}: ${line.trim()}`);
        }
    });
});
