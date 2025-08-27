import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

function getAllTypeScriptFiles(dir) {
  const files = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllTypeScriptFiles(fullPath));
    } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

const allFiles = getAllTypeScriptFiles('./src');
const violations = [];

for (const file of allFiles) {
  try {
    // Skip test files, demo files, entry points, and setup files
    if (
      file.includes('test') ||
      file.includes('\\demo\\') ||
      file.includes('/demo/') ||
      file.endsWith('index.ts') ||
      file.endsWith('test-setup.ts')
    ) {
      console.log(`SKIPPED: ${file}`);
      continue;
    }

    const content = readFileSync(file, 'utf-8');
    if (content.includes('console.log') || content.includes('console.error')) {
      violations.push(`${file}: uses direct console logging`);
      console.log(`VIOLATION: ${file}`);
    } else {
      console.log(`CLEAN: ${file}`);
    }
  } catch {
    console.log(`ERROR reading: ${file}`);
  }
}

console.log(`\nTotal violations: ${violations.length}`);
violations.forEach(v => console.log(v));
