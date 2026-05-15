const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'banda-frontend', 'src');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Replace the storage URLs first
    // `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage
    content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL\.replace\('\/api', ''\)\}\/storage/g, '/storage');

    // 2. Replace the API URLs
    // `${import.meta.env.VITE_API_URL}/user -> `/api/user
    content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL\}/g, '/api');

    // 3. Just in case there's any literal localhost:8000 left
    content = content.replace(/http:\/\/localhost:8000\/api/g, '/api');
    content = content.replace(/http:\/\/localhost:8000\/storage/g, '/storage');
    content = content.replace(/http:\/\/localhost:8000/g, '');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Hardcoded to relative: ${filePath}`);
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
console.log('Absolute relative paths enforced.');
