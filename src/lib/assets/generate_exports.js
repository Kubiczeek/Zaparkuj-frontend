import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dirPath = path.join(__dirname);
const files = fs.readdirSync(dirPath);
const svgFiles = files.filter((file) => path.extname(file) === '.svg');

const exportLines = svgFiles.map((file) => {
    const baseName = path.basename(file, '.svg');
    return `export { default as ${baseName.toLowerCase()} } from './${baseName}.svg';`;
});

fs.writeFileSync(path.join(__dirname, 'images.ts'), exportLines.join('\n'));

console.log('🟩 Generated exports for images');