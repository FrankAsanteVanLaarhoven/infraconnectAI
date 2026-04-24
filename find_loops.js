const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk('./src/components', (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        if (line.match(/set[A-Z][a-zA-Z0-9]*\(/)) {
            if (!line.includes('=>') && !line.includes('onClick') && !line.includes('onChange') && !line.includes('function')) {
                console.log(filePath + ':' + (i+1) + ' ' + line.trim());
            }
        }
    });
});
