import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

const SRC_PATH = './src';

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

function extractInterfaces(content) {
  const interfaces = [];
  const interfaceRegex = /export\s+interface\s+(\w+)\s*\{([^}]+)\}/gs;
  let match;

  while ((match = interfaceRegex.exec(content)) !== null) {
    const [, name, body] = match;
    const methods = [];

    const methodRegex = /(\w+)\s*\([^)]*\)\s*:/g;
    let methodMatch;

    while ((methodMatch = methodRegex.exec(body)) !== null) {
      methods.push(methodMatch[1]);
    }

    interfaces.push({ name, methods });
  }

  return interfaces;
}

const files = getAllTypeScriptFiles(SRC_PATH);

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const interfaces = extractInterfaces(content);

  for (const iface of interfaces) {
    if (iface.methods.length > 6) {
      console.log(`\nInterface: ${iface.name} in ${file}`);
      console.log(`Methods (${iface.methods.length}):`, iface.methods);

      const methodGroups = {
        crud: iface.methods.filter(
          m =>
            m.includes('create') ||
            m.includes('read') ||
            m.includes('update') ||
            m.includes('delete') ||
            m.includes('get') ||
            m.includes('set') ||
            m.includes('remove') ||
            m.includes('add') ||
            m.includes('insert')
        ).length,
        query: iface.methods.filter(
          m =>
            m.includes('find') ||
            m.includes('search') ||
            m.includes('filter') ||
            m.includes('query') ||
            m.includes('list') ||
            m.includes('getAll')
        ).length,
        process: iface.methods.filter(
          m =>
            m.includes('process') ||
            m.includes('execute') ||
            m.includes('run') ||
            m.includes('build') ||
            m.includes('calculate') ||
            m.includes('extract') ||
            m.includes('detect') ||
            m.includes('resolve') ||
            m.includes('recommend')
        ).length,
        validate: iface.methods.filter(
          m =>
            m.includes('validate') ||
            m.includes('check') ||
            m.includes('verify') ||
            m.includes('isCompatible') ||
            m.includes('healthCheck')
        ).length,
        lifecycle: iface.methods.filter(
          m =>
            m.includes('initialize') ||
            m.includes('destroy') ||
            m.includes('register') ||
            m.includes('unregister') ||
            m.includes('install') ||
            m.includes('enable') ||
            m.includes('disable')
        ).length,
        metadata: iface.methods.filter(
          m =>
            m.includes('getMetadata') ||
            m.includes('getSchema') ||
            m.includes('getDependencies') ||
            m.includes('getHealth') ||
            m.includes('getOrder') ||
            m.includes('getCapability') ||
            m.includes('getPlugins')
        ).length,
        transfer: iface.methods.filter(
          m =>
            m.includes('import') || m.includes('export') || m.includes('bulk') || m.includes('link')
        ).length,
      };

      const totalGroupedMethods = Object.values(methodGroups).reduce((a, b) => a + b, 0);
      const ratio = totalGroupedMethods / iface.methods.length;

      console.log('Method groups:', methodGroups);
      console.log(`Grouped: ${totalGroupedMethods}/${iface.methods.length} = ${ratio.toFixed(3)}`);

      if (ratio <= 0.6) {
        console.log('❌ FAILING: Ratio too low!');
      } else {
        console.log('✅ PASSING: Good grouping');
      }
    }
  }
}
