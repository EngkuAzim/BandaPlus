const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'banda-frontend', 'src');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Replace backtick template literals
    content = content.replace(/`http:\/\/localhost:8000(.*?)(`)?/g, (match, p1, p2) => {
        if (!p2) {
             // It's a template literal without closing backtick in the match, but JS regex might not capture the end if we just do .*
        }
        return `${match}`;
    });

    // Instead of complex regex, let's just do a simple string replacement since we know the context
    // We want to turn: 'http://localhost:8000/api/user' -> `${import.meta.env.VITE_API_URL}/api/user`
    // and `http://localhost:8000/storage/${log}` -> `${import.meta.env.VITE_API_URL}/storage/${log}`

    // 1. Replace single-quoted strings
    content = content.replace(/'http:\/\/localhost:8000([^']*)'/g, '`${import.meta.env.VITE_API_URL}$1`');
    
    // 2. Replace double-quoted strings
    content = content.replace(/"http:\/\/localhost:8000([^"]*)"/g, '`${import.meta.env.VITE_API_URL}$1`');
    
    // 3. Replace within existing template literals
    content = content.replace(/http:\/\/localhost:8000/g, '${import.meta.env.VITE_API_URL}');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            replaceInFile(fullPath);
        }
    }
}

walkDir(directoryPath);
console.log('Replacement complete.');
