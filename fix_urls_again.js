const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'banda-frontend', 'src');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // We previously changed:
    // `http://localhost:8000/api/...` to `${import.meta.env.VITE_API_URL}/api/...`
    // `http://localhost:8000/storage/...` to `${import.meta.env.VITE_API_URL}/storage/...`
    
    // If VITE_API_URL is '/api' or 'http://IP/api':
    // 1. `${import.meta.env.VITE_API_URL}/api` -> `${import.meta.env.VITE_API_URL}`
    content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL\}\/api/g, '${import.meta.env.VITE_API_URL}');
    
    // 2. `${import.meta.env.VITE_API_URL}/storage` -> `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage`
    content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL\}\/storage/g, '${import.meta.env.VITE_API_URL.replace(\'/api\', \'\')}/storage');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${filePath}`);
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
console.log('Fixes complete.');
