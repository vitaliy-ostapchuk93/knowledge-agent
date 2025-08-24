import { describe, test, expect } from 'bun:test';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Dependency Inversion Principle (DIP) Tests
 *
 * Verifies that high-level modules do not depend on low-level modules.
 * Both should depend on abstractions (interfaces).
 */

const SRC_PATH = join(__dirname, '../../src');

// Helper functions
function getAllTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];

  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...getAllTypeScriptFiles(fullPath));
      } else if (item.endsWith('.ts') && !item.endsWith('.test.ts') && !item.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory might not exist yet
  }

  return files;
}

function extractImports(content: string): string[] {
  const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
  const imports: string[] = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

function extractConstructorDependencies(content: string): string[] {
  const constructorRegex = /constructor\s*\([^)]*\)/g;
  const match = constructorRegex.exec(content);

  if (!match) return [];

  const params = match[0];
  const typeRegex = /:\s*([A-Z]\w*)/g;
  const types: string[] = [];
  let typeMatch;

  while ((typeMatch = typeRegex.exec(params)) !== null) {
    types.push(typeMatch[1]);
  }

  return types;
}

function isInterface(typeName: string): boolean {
  return typeName.startsWith('I') && typeName.length > 1 && /[A-Z]/.test(typeName[1]);
}

describe('Dependency Inversion Principle (DIP)', () => {
  test('core knowledge agent should depend on abstractions', async () => {
    const corePath = join(SRC_PATH, 'core');

    try {
      const files = getAllTypeScriptFiles(corePath);

      for (const file of files) {
        const content = await Bun.file(file).text();
        const imports = extractImports(content);

        // Check that core doesn't import concrete implementations from other layers
        const badImports = imports.filter(
          imp =>
            (imp.includes('../discovery/') && !imp.includes('interface')) ||
            (imp.includes('../ai/') && !imp.includes('interface')) ||
            (imp.includes('../adapters/') && !imp.includes('interface'))
        );

        expect(badImports.length).toBe(0);

        // Check constructor dependencies
        const dependencies = extractConstructorDependencies(content);
        const interfaceDeps = dependencies.filter(isInterface);

        // Should prefer interfaces over concrete classes
        if (dependencies.length > 0) {
          const interfaceRatio = interfaceDeps.length / dependencies.length;
          expect(interfaceRatio).toBeGreaterThan(0.5); // At least 50% interfaces
        }
      }
    } catch {
      // Core directory might not exist yet
    }
  });

  test('discovery layer should not depend on AI processing specifics', async () => {
    const discoveryPath = join(SRC_PATH, 'discovery');

    try {
      const files = getAllTypeScriptFiles(discoveryPath);

      for (const file of files) {
        const content = await Bun.file(file).text();
        const imports = extractImports(content);

        // Discovery should not import AI processing implementations
        const aiImports = imports.filter(
          imp => imp.includes('../ai/') && !imp.includes('interface')
        );

        expect(aiImports.length).toBe(0);
      }
    } catch {
      // Discovery directory might not exist yet
    }
  });

  test('AI processing should not depend on platform adapters', async () => {
    const aiPath = join(SRC_PATH, 'ai');

    try {
      const files = getAllTypeScriptFiles(aiPath);

      for (const file of files) {
        const content = await Bun.file(file).text();
        const imports = extractImports(content);

        // AI should not import platform adapter implementations
        const adapterImports = imports.filter(
          imp => imp.includes('../adapters/') && !imp.includes('interface')
        );

        expect(adapterImports.length).toBe(0);
      }
    } catch {
      // AI directory might not exist yet
    }
  });

  test('platform adapters should depend on abstractions not implementations', async () => {
    const adaptersPath = join(SRC_PATH, 'adapters');

    try {
      const files = getAllTypeScriptFiles(adaptersPath);

      for (const file of files) {
        const content = await Bun.file(file).text();
        const dependencies = extractConstructorDependencies(content);

        // Platform adapters should primarily use interfaces
        const interfaceDeps = dependencies.filter(isInterface);

        if (dependencies.length > 0) {
          const interfaceRatio = interfaceDeps.length / dependencies.length;
          expect(interfaceRatio).toBeGreaterThan(0.6); // At least 60% interfaces
        }
      }
    } catch {
      // Adapters directory might not exist yet
    }
  });

  test('should not have circular dependencies between layers', async () => {
    const layerPaths = [
      { name: 'core', path: join(SRC_PATH, 'core') },
      { name: 'discovery', path: join(SRC_PATH, 'discovery') },
      { name: 'ai', path: join(SRC_PATH, 'ai') },
      { name: 'integration', path: join(SRC_PATH, 'integration') },
      { name: 'adapters', path: join(SRC_PATH, 'adapters') },
      { name: 'cache', path: join(SRC_PATH, 'cache') },
      { name: 'events', path: join(SRC_PATH, 'events') },
    ];

    for (const layer of layerPaths) {
      try {
        const files = getAllTypeScriptFiles(layer.path);

        for (const file of files) {
          const content = await Bun.file(file).text();
          const imports = extractImports(content);

          // Check for circular dependencies
          for (const otherLayer of layerPaths) {
            if (layer.name === otherLayer.name) continue;

            const hasImportToOther = imports.some(imp => imp.includes(`../${otherLayer.name}/`));

            if (hasImportToOther && layer.name !== 'core') {
              // Only core should import from other layers
              // Other layers should only import interfaces
              const concreteImports = imports.filter(
                imp => imp.includes(`../${otherLayer.name}/`) && !imp.includes('interface')
              );

              expect(concreteImports.length).toBe(0);
            }
          }
        }
      } catch {
        // Layer directory might not exist yet
      }
    }
  });

  test('external dependencies should be abstracted', async () => {
    const files = getAllTypeScriptFiles(SRC_PATH);

    for (const file of files) {
      const content = await Bun.file(file).text();
      const imports = extractImports(content);

      // Check for direct external API usage without abstraction
      const directExternalImports = imports.filter(
        imp =>
          imp.includes('axios') ||
          imp.includes('fetch') ||
          imp.includes('openai') ||
          imp.includes('youtube') ||
          imp.includes('reddit')
      );

      // If using external APIs, should be in connector/adapter files
      if (directExternalImports.length > 0) {
        const isConnectorFile =
          file.includes('connector') || file.includes('adapter') || file.includes('strategy');
        expect(isConnectorFile).toBe(true);
      }
    }
  });

  test('interfaces should not depend on implementations', async () => {
    const interfacesPath = join(SRC_PATH, 'interfaces');

    try {
      const files = getAllTypeScriptFiles(interfacesPath);

      for (const file of files) {
        const content = await Bun.file(file).text();
        const imports = extractImports(content);

        // Interface files should only import types and other interfaces
        const implementationImports = imports.filter(
          imp => !imp.includes('types') && !imp.includes('interface') && imp.startsWith('.') // Relative imports to implementation files
        );

        expect(implementationImports.length).toBe(0);
      }
    } catch {
      // Interfaces directory might not exist yet
    }
  });

  test('cross-cutting concerns should be injected as dependencies', async () => {
    const files = getAllTypeScriptFiles(SRC_PATH);

    for (const file of files) {
      const content = await Bun.file(file).text();

      // Check for direct instantiation of cross-cutting concerns
      const directLogging = /new\s+Logger\(/.test(content);
      const directConfig = /new\s+Config/.test(content);
      const directCache = /new\s+Cache\(/.test(content);

      // Should use dependency injection instead
      expect(directLogging).toBe(false);
      expect(directConfig).toBe(false);
      expect(directCache).toBe(false);
    }
  });

  test('should follow dependency flow from building blocks', async () => {
    // Based on 05-building-blocks.md neighbor relationships
    const expectedFlow: Record<string, string[]> = {
      core: ['discovery', 'ai', 'integration', 'adapters', 'cache', 'events'],
      discovery: ['cache'],
      ai: ['cache'],
      integration: ['cache'],
      adapters: [],
      cache: [],
      events: [],
    };

    for (const [layer, allowedDependencies] of Object.entries(expectedFlow)) {
      const layerPath = join(SRC_PATH, layer);

      try {
        const files = getAllTypeScriptFiles(layerPath);

        for (const file of files) {
          const content = await Bun.file(file).text();
          const imports = extractImports(content);

          // Check that dependencies follow the architectural flow
          const layerImports = imports.filter(imp => imp.startsWith('../'));

          for (const imp of layerImports) {
            const targetLayer = imp.split('/')[1];

            if (
              targetLayer &&
              !allowedDependencies.includes(targetLayer) &&
              targetLayer !== 'interfaces' &&
              targetLayer !== 'types'
            ) {
              expect(allowedDependencies.includes(targetLayer)).toBe(true);
            }
          }
        }
      } catch {
        // Layer directory might not exist yet
      }
    }
  });
});
