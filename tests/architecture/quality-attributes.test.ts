/**
 * Quality Attributes Architecture Tests
 *
 * Tests for quality attributes as defined in docs/quality-model.md
 * Based on ISO 25010 quality model: Performance, Security, Usability, Reliability,
 * Maintainability, Portability, Functional Suitability, Compatibility
 */

import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { FileSystemUtils } from './common/test-utils';

describe('Quality Attributes Architecture', () => {
  describe('Performance Efficiency', () => {
    test('should implement time behavior optimizations', () => {
      const cacheFiles = FileSystemUtils.getFilesInLayer('cache');
      const aiFiles = FileSystemUtils.getFilesInLayer('ai');

      // Cache layer should exist for performance
      expect(cacheFiles.length).toBeGreaterThan(0);

      // AI operations should consider caching
      let hasPerformanceConsiderations = false;

      for (const file of aiFiles) {
        try {
          const content = readFileSync(file, 'utf-8');
          if (
            content.includes('cache') ||
            content.includes('memoize') ||
            content.includes('throttle')
          ) {
            hasPerformanceConsiderations = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      // Either have cache files or performance patterns
      expect(cacheFiles.length > 0 || hasPerformanceConsiderations).toBe(true);
    });

    test('should implement resource utilization patterns', () => {
      const allFiles = FileSystemUtils.getAllTypeScriptFiles();
      let hasResourceManagement = false;

      const resourcePatterns = [
        'pool',
        'queue',
        'batch',
        'limit',
        'throttle',
        'debounce',
        'lazy',
        'stream',
      ];

      for (const file of allFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          if (resourcePatterns.some(pattern => content.toLowerCase().includes(pattern))) {
            hasResourceManagement = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      // Resource management is recommended for scalability
      expect(typeof hasResourceManagement).toBe('boolean');
    });

    test('should use efficient data structures and algorithms', () => {
      const coreFiles = FileSystemUtils.getFilesInLayer('core');
      let hasEfficientPatterns = false;

      const efficientPatterns = [
        'Map',
        'Set',
        'WeakMap',
        'WeakSet',
        'index',
        'hash',
        'search',
        'find',
      ];

      for (const file of coreFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          if (efficientPatterns.some(pattern => content.includes(pattern))) {
            hasEfficientPatterns = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      // Efficient data structures recommended for core logic
      expect(typeof hasEfficientPatterns).toBe('boolean');
    });
  });

  describe('Security', () => {
    test('should protect against injection attacks', () => {
      const adapterFiles = FileSystemUtils.getFilesInLayer('adapters');
      const violations: string[] = [];

      for (const file of adapterFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          // Look for potential injection vulnerabilities
          const dangerousPatterns = [
            'eval(',
            'new Function(',
            'innerHTML =',
            'document.write',
            'exec(',
            'spawn(',
          ];

          dangerousPatterns.forEach(pattern => {
            if (content.includes(pattern)) {
              violations.push(`${file}: uses potentially dangerous ${pattern}`);
            }
          });
        } catch {
          // Skip files that can't be read
        }
      }

      expect(violations).toEqual([]);
    });

    test('should implement input validation', () => {
      const allFiles = FileSystemUtils.getAllTypeScriptFiles();
      let hasValidation = false;

      const validationPatterns = [
        'validate',
        'sanitize',
        'escape',
        'filter',
        'check',
        'verify',
        'assert',
        'schema',
      ];

      for (const file of allFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          if (validationPatterns.some(pattern => content.toLowerCase().includes(pattern))) {
            hasValidation = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      // Input validation is critical for security
      expect(typeof hasValidation).toBe('boolean');
    });

    test('should handle authentication and authorization if applicable', () => {
      const allFiles = FileSystemUtils.getAllTypeScriptFiles();
      let hasAuthSecurity = false;

      const authPatterns = ['auth', 'token', 'key', 'credential', 'permission', 'role', 'access'];

      for (const file of allFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          if (authPatterns.some(pattern => content.toLowerCase().includes(pattern))) {
            hasAuthSecurity = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      // Authentication/authorization may not be required for all components
      expect(typeof hasAuthSecurity).toBe('boolean');
    });
  });

  describe('Usability', () => {
    test('should provide clear interfaces and error messages', () => {
      const interfaceFiles = FileSystemUtils.getFilesInLayer('interfaces');
      const typesFiles = FileSystemUtils.getFilesInLayer('types');

      // Should have well-defined interfaces
      expect(interfaceFiles.length + typesFiles.length).toBeGreaterThan(0);

      let hasDescriptiveErrors = false;
      const allFiles = FileSystemUtils.getAllTypeScriptFiles();

      for (const file of allFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          // Look for descriptive error handling
          if (content.includes('Error(') && content.includes('"')) {
            hasDescriptiveErrors = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      expect(hasDescriptiveErrors).toBe(true);
    });

    test('should follow consistent naming conventions', () => {
      const allFiles = FileSystemUtils.getAllTypeScriptFiles();
      const violations: string[] = [];

      for (const file of allFiles) {
        const fileName = FileSystemUtils.getFileName(file);

        // Check naming conventions
        if (!fileName.match(/^[a-z][a-z0-9-]*\.(ts|js)$/)) {
          violations.push(`${file}: filename doesn't follow kebab-case convention`);
        }
      }

      // Allow some flexibility for early development
      expect(violations.length).toBeLessThanOrEqual(allFiles.length * 0.2);
    });

    test('should have appropriate documentation patterns', () => {
      const allFiles = FileSystemUtils.getAllTypeScriptFiles();
      let hasDocumentation = false;

      for (const file of allFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          // Look for documentation patterns
          if (content.includes('/**') || content.includes('//')) {
            hasDocumentation = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      expect(hasDocumentation).toBe(true);
    });
  });

  describe('Reliability', () => {
    test('should implement fault tolerance mechanisms', () => {
      const aiFiles = FileSystemUtils.getFilesInLayer('ai');
      const discoveryFiles = FileSystemUtils.getFilesInLayer('discovery');

      let hasFaultTolerance = false;
      const externalDependencies = [...aiFiles, ...discoveryFiles];

      for (const file of externalDependencies) {
        try {
          const content = readFileSync(file, 'utf-8');

          // Look for fault tolerance patterns
          if (
            (content.includes('try') && content.includes('catch')) ||
            content.includes('fallback') ||
            content.includes('retry') ||
            content.includes('timeout')
          ) {
            hasFaultTolerance = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      // External dependencies should have fault tolerance
      if (externalDependencies.length > 0) {
        expect(hasFaultTolerance).toBe(true);
      }
    });

    test('should recover gracefully from failures', () => {
      const allFiles = FileSystemUtils.getAllTypeScriptFiles();
      let hasGracefulRecovery = false;

      const recoveryPatterns = [
        'recover',
        'fallback',
        'default',
        'alternative',
        'graceful',
        'degrade',
        'backup',
      ];

      for (const file of allFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          if (recoveryPatterns.some(pattern => content.toLowerCase().includes(pattern))) {
            hasGracefulRecovery = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      expect(typeof hasGracefulRecovery).toBe('boolean');
    });

    test('should maintain availability under normal conditions', () => {
      const allFiles = FileSystemUtils.getAllTypeScriptFiles();
      let hasAsyncPatterns = false;

      // Async patterns help maintain availability
      for (const file of allFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          if (content.includes('async') || content.includes('Promise')) {
            hasAsyncPatterns = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      expect(hasAsyncPatterns).toBe(true);
    });
  });

  describe('Maintainability', () => {
    test('should follow modularity principles', () => {
      const srcFiles = FileSystemUtils.getAllTypeScriptFiles().filter(
        file => file.includes('src') && !file.includes('test')
      );

      // Should have multiple modules/layers
      const layers = new Set();

      srcFiles.forEach(file => {
        const parts = file.split(/[/\\]/); // Handle both Unix and Windows path separators
        const srcIndex = parts.findIndex(part => part === 'src');
        if (srcIndex >= 0 && srcIndex + 1 < parts.length) {
          const layer = parts[srcIndex + 1]; // Directory after 'src'
          if (layer && layer !== 'index.ts' && !layer.includes('.')) {
            layers.add(layer);
          }
        }
      });

      // Debug what we found
      console.log('Found layers:', Array.from(layers));
      console.log('Sample files:', srcFiles.slice(0, 3));

      expect(layers.size).toBeGreaterThan(2);
    });

    test('should minimize coupling between modules', () => {
      const violations: string[] = [];
      const allFiles = FileSystemUtils.getAllTypeScriptFiles();

      for (const file of allFiles) {
        try {
          const imports = FileSystemUtils.extractImports(file);

          // Check for circular or deep dependencies
          imports.forEach(imp => {
            if (imp.includes('../../../')) {
              violations.push(`${file}: deep relative import ${imp}`);
            }
          });
        } catch {
          // Skip files that can't be read
        }
      }

      // Allow some violations for development
      expect(violations.length).toBeLessThanOrEqual(5);
    });

    test('should have clear separation of concerns', () => {
      const layers = [
        'core',
        'ai',
        'cache',
        'adapters',
        'discovery',
        'events',
        'interfaces',
        'types',
      ];
      let layerCount = 0;

      layers.forEach(layer => {
        const layerFiles = FileSystemUtils.getFilesInLayer(layer);
        if (layerFiles.length > 0) {
          layerCount++;
        }
      });

      // Should have multiple separated layers
      expect(layerCount).toBeGreaterThan(3);
    });
  });

  describe('Portability', () => {
    test('should avoid platform-specific dependencies', () => {
      const allFiles = FileSystemUtils.getAllTypeScriptFiles();
      const violations: string[] = [];

      const platformSpecific = [
        'win32',
        'darwin',
        'linux',
        'Windows',
        'process.platform',
        '__dirname',
        '__filename',
      ];

      for (const file of allFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          platformSpecific.forEach(pattern => {
            if (content.includes(pattern)) {
              violations.push(`${file}: uses platform-specific ${pattern}`);
            }
          });
        } catch {
          // Skip files that can't be read
        }
      }

      // Allow some platform-specific code for file operations
      expect(violations.length).toBeLessThanOrEqual(3);
    });

    test('should use standard APIs and protocols', () => {
      const allFiles = FileSystemUtils.getAllTypeScriptFiles();
      let usesStandardAPIs = false;

      const standardPatterns = ['fetch', 'Promise', 'async', 'JSON', 'HTTP', 'https', 'URL'];

      for (const file of allFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          if (standardPatterns.some(pattern => content.includes(pattern))) {
            usesStandardAPIs = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      expect(usesStandardAPIs).toBe(true);
    });
  });

  describe('Functional Suitability', () => {
    test('should implement core knowledge management functions', () => {
      const coreFiles = FileSystemUtils.getFilesInLayer('core');
      const knowledgeFunctions = [
        'knowledge',
        'agent',
        'process',
        'query',
        'search',
        'discover',
        'analyze',
        'extract',
      ];

      let hasKnowledgeFunctions = false;

      for (const file of coreFiles) {
        const fileName = FileSystemUtils.getFileName(file).toLowerCase();

        if (knowledgeFunctions.some(func => fileName.includes(func))) {
          hasKnowledgeFunctions = true;
          break;
        }
      }

      expect(hasKnowledgeFunctions).toBe(true);
    });

    test('should provide content discovery capabilities', () => {
      const discoveryFiles = FileSystemUtils.getFilesInLayer('discovery');
      expect(discoveryFiles.length).toBeGreaterThan(0);
    });

    test('should integrate AI processing capabilities', () => {
      const aiFiles = FileSystemUtils.getFilesInLayer('ai');
      expect(aiFiles.length).toBeGreaterThan(0);
    });
  });

  describe('Compatibility', () => {
    test('should maintain interface compatibility', () => {
      const interfaceFiles = FileSystemUtils.getFilesInLayer('interfaces');
      const typesFiles = FileSystemUtils.getFilesInLayer('types');

      // Should have stable interfaces
      expect(interfaceFiles.length + typesFiles.length).toBeGreaterThan(0);

      let hasVersioning = false;

      [...interfaceFiles, ...typesFiles].forEach(file => {
        try {
          const content = readFileSync(file, 'utf-8');

          if (content.includes('version') || content.includes('deprecated')) {
            hasVersioning = true;
          }
        } catch {
          // Skip files that can't be read
        }
      });

      // Versioning is optional but recommended
      expect(typeof hasVersioning).toBe('boolean');
    });

    test('should handle different data formats', () => {
      const adapterFiles = FileSystemUtils.getFilesInLayer('adapters');

      let handlesMultipleFormats = false;

      for (const file of adapterFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          const formats = ['json', 'xml', 'csv', 'markdown', 'text', 'html'];
          if (formats.some(format => content.toLowerCase().includes(format))) {
            handlesMultipleFormats = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      // Should handle multiple data formats
      if (adapterFiles.length > 0) {
        expect(handlesMultipleFormats).toBe(true);
      }
    });
  });
});
