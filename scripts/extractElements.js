import fs from 'node:fs';
import path from 'node:path';

const elementsTsPath = path.resolve(process.cwd(), 'src/data/elements.ts');
const content = fs.readFileSync(elementsTsPath, 'utf8');

const start = content.indexOf('export const ELEMENTS_DATA');
const arrayStart = content.indexOf('[', start);
const arrayEnd = content.indexOf('];', arrayStart);

if (start === -1 || arrayStart === -1 || arrayEnd === -1) {
  console.error('Could not locate ELEMENTS_DATA in file');
  process.exit(1);
}

const jsonSlice = content.slice(arrayStart, arrayEnd + 1);
const outPath = path.resolve(process.cwd(), 'scripts/questionGenerator/elementsData.js');
fs.writeFileSync(outPath, `// Extracted 118 Elements dataset\nexport const ELEMENTS_DATA = ${jsonSlice};\n`, 'utf8');

console.log('Successfully extracted 118 elements to scripts/questionGenerator/elementsData.js');
