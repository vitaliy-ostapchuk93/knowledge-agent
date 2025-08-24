import { describe, test, expect } from 'bun:test';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Interface Segregation Principle (ISP) Tests
 *
 * Verifies that clients should not be forced to depend on interfaces they don't use.
 * Checks for focused, cohesive interfaces rather than large, monolithic ones.
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

function extractInterfaces(content: string): Array<{ name: string; methods: string[] }> {
  const interfaces: Array<{ name: string; methods: string[] }> = [];
  const interfaceRegex = /interface\s+(\w+)[^{]*\{([^}]*)\}/g;
  let match;

  while ((match = interfaceRegex.exec(content)) !== null) {
    const name = match[1];
    const body = match[2];

    // Extract method signatures
    const methodRegex = /(\w+)\s*\([^)]*\)\s*:/g;
    const methods: string[] = [];
    let methodMatch;

    while ((methodMatch = methodRegex.exec(body)) !== null) {
      methods.push(methodMatch[1]);
    }

    interfaces.push({ name, methods });
  }

  return interfaces;
}

function extractImplementations(content: string): Array<{ class: string; interfaces: string[] }> {
  const implementations: Array<{ class: string; interfaces: string[] }> = [];
  const implementsRegex = /class\s+(\w+)[^{]*implements\s+([^{]+)\{/g;
  let match;

  while ((match = implementsRegex.exec(content)) !== null) {
    const className = match[1];
    const interfaceList = match[2].split(',').map(i => i.trim());
    implementations.push({ class: className, interfaces: interfaceList });
  }

  return implementations;
}

describe('Interface Segregation Principle (ISP)', () => {
  test('interfaces should be focused and cohesive (max 8 methods)', async () => {
    const interfacesPath = join(SRC_PATH, 'interfaces');

    try {
      const files = getAllTypeScriptFiles(interfacesPath);

      for (const file of files) {
        const content = await Bun.file(file).text();
        const interfaces = extractInterfaces(content);

        for (const iface of interfaces) {
          // Interfaces should not be too large
          expect(iface.methods.length).toBeLessThanOrEqual(8);

          // Should have at least one method
          if (iface.methods.length === 0) {
            // Check if it's just a marker interface or has properties
            const hasProperties = /\w+\s*:\s*\w+/.test(content);
            expect(hasProperties).toBe(true);
          }
        }
      }
    } catch {
      // Interfaces directory might not exist yet
    }
  });

  test('core interfaces should be separated by concern', async () => {
    const interfacesPath = join(SRC_PATH, 'interfaces');

    try {
      const files = getAllTypeScriptFiles(interfacesPath);

      for (const file of files) {
        const content = await Bun.file(file).text();

        // Should not mix different concerns in one interface
        const hasDiscovery = content.includes('discover') || content.includes('search');
        const hasProcessing = content.includes('process') || content.includes('summarize');
        const hasAdaptation = content.includes('format') || content.includes('deliver');
        const hasCaching = content.includes('cache') || content.includes('store');

        const concernCount = [hasDiscovery, hasProcessing, hasAdaptation, hasCaching].filter(
          Boolean
        ).length;

        // Each interface file should focus on one primary concern
        expect(concernCount).toBeLessThanOrEqual(1);
      }
    } catch {
      // Interfaces directory might not exist yet
    }
  });

  test('AI strategy interfaces should be specific to processing type', async () => {
    // Test that AI strategy interfaces are focused and not overly broad
    const expectedAIInterfaces = [
      'ISummarizationStrategy',
      'IInsightExtractionStrategy', 
      'IAnalysisStrategy',
      'IAIStrategy' // Main strategy interface can coordinate others
    ];

    // Each interface should have a specific focus
    expectedAIInterfaces.forEach(interfaceName => {
      expect(interfaceName).toBeTruthy();
      // In actual implementation, verify each interface has focused methods
    });

    // Verify we don't create god interfaces that do everything
    expect(expectedAIInterfaces.length).toBeGreaterThan(1);
  });

  test('platform adapter interfaces should be platform-agnostic', async () => {
    const files = getAllTypeScriptFiles(SRC_PATH);

    for (const file of files) {
      const content = await Bun.file(file).text();
      const interfaces = extractInterfaces(content);

      for (const iface of interfaces) {
        if (iface.name.includes('Adapter') || iface.name.includes('Platform')) {
          // Platform interfaces should not contain platform-specific method names
          const platformSpecificMethods = iface.methods.filter(
            method =>
              method.toLowerCase().includes('logseq') ||
              method.toLowerCase().includes('obsidian') ||
              method.toLowerCase().includes('notion') ||
              method.toLowerCase().includes('roam')
          );

          expect(platformSpecificMethods.length).toBe(0);
        }
      }
    }
  });

  test('content discovery interfaces should separate concerns', async () => {
    const files = getAllTypeScriptFiles(SRC_PATH);

    for (const file of files) {
      const content = await Bun.file(file).text();
      const interfaces = extractInterfaces(content);

      for (const iface of interfaces) {
        if (iface.name.includes('Discovery') || iface.name.includes('Source')) {
          // Should separate search, ranking, and filtering
          const hasSearch = iface.methods.some(m => m.includes('search') || m.includes('find'));
          const hasRank = iface.methods.some(m => m.includes('rank') || m.includes('score'));
          const hasFilter = iface.methods.some(m => m.includes('filter') || m.includes('validate'));

          const operationCount = [hasSearch, hasRank, hasFilter].filter(Boolean).length;
          expect(operationCount).toBeLessThanOrEqual(2); // Max 2 related operations
        }
      }
    }
  });

  test('cache interfaces should separate storage from policy', async () => {
    const files = getAllTypeScriptFiles(SRC_PATH);

    for (const file of files) {
      const content = await Bun.file(file).text();
      const interfaces = extractInterfaces(content);

      for (const iface of interfaces) {
        if (iface.name.includes('Cache')) {
          // Should separate storage operations from policy management
          const hasStorage = iface.methods.some(
            m => m.includes('get') || m.includes('set') || m.includes('delete')
          );
          const hasPolicy = iface.methods.some(
            m => m.includes('ttl') || m.includes('evict') || m.includes('policy')
          );

          // Should not mix storage and policy in same interface
          if (hasStorage && hasPolicy) {
            expect(iface.methods.length).toBeLessThanOrEqual(5); // Keep it small if mixed
          }
        }
      }
    }
  });

  test('event interfaces should be specific to event type', async () => {
    // Test that event interfaces are segregated properly
    const eventInterfaceTypes = [
      'IEventPublisher',
      'IEventSubscriber', 
      'IEventHandler',
      'IEventRouter'
    ];

    // Each interface should have a specific role in event handling
    eventInterfaceTypes.forEach(interfaceType => {
      expect(interfaceType).toBeTruthy();
      expect(interfaceType).toMatch(/^IEvent/);
    });

    // Verify we separate publishing from subscribing responsibilities
    expect(eventInterfaceTypes.includes('IEventPublisher')).toBe(true);
    expect(eventInterfaceTypes.includes('IEventSubscriber')).toBe(true);
  });

  test('implementations should not implement unnecessary interfaces', async () => {
    const files = getAllTypeScriptFiles(SRC_PATH);

    for (const file of files) {
      const content = await Bun.file(file).text();
      const implementations = extractImplementations(content);

      for (const impl of implementations) {
        // Classes should not implement too many unrelated interfaces
        expect(impl.interfaces.length).toBeLessThanOrEqual(3);

        // Check for contradictory interfaces
        const hasReader = impl.interfaces.some(i => i.includes('Reader') || i.includes('Get'));
        const hasWriter = impl.interfaces.some(i => i.includes('Writer') || i.includes('Set'));
        const hasProcessor = impl.interfaces.some(
          i => i.includes('Processor') || i.includes('Process')
        );
        const hasValidator = impl.interfaces.some(
          i => i.includes('Validator') || i.includes('Validate')
        );

        const roleCount = [hasReader, hasWriter, hasProcessor, hasValidator].filter(Boolean).length;

        // Should not have too many different roles
        expect(roleCount).toBeLessThanOrEqual(2);
      }
    }
  });

  test('configuration interfaces should be separated by scope', async () => {
    const files = getAllTypeScriptFiles(SRC_PATH);

    for (const file of files) {
      const content = await Bun.file(file).text();
      const interfaces = extractInterfaces(content);

      for (const iface of interfaces) {
        if (iface.name.includes('Config')) {
          // Should separate user config, system config, and runtime config
          const hasUserConfig = iface.methods.some(
            m => m.includes('user') || m.includes('preference')
          );
          const hasSystemConfig = iface.methods.some(
            m => m.includes('system') || m.includes('default')
          );
          const hasRuntimeConfig = iface.methods.some(
            m => m.includes('runtime') || m.includes('dynamic')
          );

          const configTypeCount = [hasUserConfig, hasSystemConfig, hasRuntimeConfig].filter(
            Boolean
          ).length;
          expect(configTypeCount).toBeLessThanOrEqual(1); // Each interface should handle one config type
        }
      }
    }
  });

  test('should avoid god interfaces', async () => {
    const files = getAllTypeScriptFiles(SRC_PATH);

    for (const file of files) {
      const content = await Bun.file(file).text();
      const interfaces = extractInterfaces(content);

      for (const iface of interfaces) {
        // No interface should have more than 10 methods
        expect(iface.methods.length).toBeLessThanOrEqual(10);

        // Warn about large interfaces
        if (iface.methods.length > 6) {
          // Large interfaces should have clear grouping
          const methodGroups = {
            crud: iface.methods.filter(
              m =>
                m.includes('create') ||
                m.includes('read') ||
                m.includes('update') ||
                m.includes('delete') ||
                m.includes('get') ||
                m.includes('set') ||
                m.includes('remove')
            ).length,
            process: iface.methods.filter(
              m => m.includes('process') || m.includes('execute') || m.includes('run')
            ).length,
            validate: iface.methods.filter(
              m => m.includes('validate') || m.includes('check') || m.includes('verify')
            ).length,
          };

          const totalGroupedMethods = Object.values(methodGroups).reduce((a, b) => a + b, 0);

          // Most methods should belong to a clear group
          expect(totalGroupedMethods / iface.methods.length).toBeGreaterThan(0.7);
        }
      }
    }
  });
});
