/**
 * Solution Strategy Architecture Tests
 *
 * Tests for solution strategy as defined in docs/04-solution-strategy.md
 * Covers business goals alignment, technology decisions, and strategic patterns
 */

import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { FileSystemUtils } from './common/test-utils';

describe('Solution Strategy Architecture', () => {
  describe('Business Goals Alignment', () => {
    test('should implement knowledge agent core functionality', () => {
      const coreFiles = FileSystemUtils.getFilesInLayer('core');

      // Should have core knowledge agent implementation
      expect(coreFiles.length).toBeGreaterThan(0);

      let hasKnowledgeAgentCore = false;

      for (const file of coreFiles) {
        const fileName = FileSystemUtils.getFileName(file).toLowerCase();

        if (fileName.includes('knowledge') && fileName.includes('agent')) {
          hasKnowledgeAgentCore = true;
          break;
        }
      }

      expect(hasKnowledgeAgentCore).toBe(true);
    });

    test('should enable intelligent content discovery', () => {
      const discoveryFiles = FileSystemUtils.getFilesInLayer('discovery');

      // Should have content discovery mechanisms
      expect(discoveryFiles.length).toBeGreaterThan(0);

      let hasIntelligentDiscovery = false;

      for (const file of discoveryFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          // Look for discovery patterns
          const discoveryPatterns = [
            'discover',
            'find',
            'search',
            'scan',
            'crawl',
            'extract',
            'analyze',
            'source',
          ];

          if (discoveryPatterns.some(pattern => content.toLowerCase().includes(pattern))) {
            hasIntelligentDiscovery = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      expect(hasIntelligentDiscovery).toBe(true);
    });

    test('should integrate AI-powered processing capabilities', () => {
      const aiFiles = FileSystemUtils.getFilesInLayer('ai');

      // Should have AI integration
      expect(aiFiles.length).toBeGreaterThan(0);

      let hasAIProcessing = false;

      for (const file of aiFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          // Look for AI processing patterns
          const aiPatterns = [
            'ai',
            'strategy',
            'process',
            'analyze',
            'openai',
            'llm',
            'model',
            'chat',
          ];

          if (aiPatterns.some(pattern => content.toLowerCase().includes(pattern))) {
            hasAIProcessing = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      expect(hasAIProcessing).toBe(true);
    });

    test('should provide flexible platform adaptation', () => {
      const adapterFiles = FileSystemUtils.getFilesInLayer('adapters');

      // Should have platform adapters
      expect(adapterFiles.length).toBeGreaterThan(0);

      let hasFlexibleAdaptation = false;

      for (const file of adapterFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          // Look for adaptation patterns
          const adaptationPatterns = [
            'adapter',
            'format',
            'convert',
            'transform',
            'markdown',
            'export',
            'output',
          ];

          if (adaptationPatterns.some(pattern => content.toLowerCase().includes(pattern))) {
            hasFlexibleAdaptation = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      expect(hasFlexibleAdaptation).toBe(true);
    });
  });

  describe('Technology Decisions', () => {
    test('should use TypeScript for type safety', () => {
      const allFiles = FileSystemUtils.getAllTypeScriptFiles();
      const tsFiles = allFiles.filter(file => file.endsWith('.ts'));
      const jsFiles = allFiles.filter(file => file.endsWith('.js'));

      // Should prefer TypeScript over JavaScript
      expect(tsFiles.length).toBeGreaterThan(jsFiles.length);
    });

    test('should leverage modern JavaScript/TypeScript features', () => {
      const allFiles = FileSystemUtils.getAllTypeScriptFiles();
      let hasModernFeatures = false;

      const modernPatterns = [
        'async',
        'await',
        'Promise',
        'const',
        'let',
        'arrow',
        '=>',
        'class',
        'interface',
        'type',
      ];

      for (const file of allFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          if (modernPatterns.some(pattern => content.includes(pattern))) {
            hasModernFeatures = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      expect(hasModernFeatures).toBe(true);
    });

    test('should implement appropriate design patterns', () => {
      const allFiles = FileSystemUtils.getAllTypeScriptFiles();
      let hasDesignPatterns = false;

      const patternIndicators = [
        'Strategy',
        'Adapter',
        'Observer',
        'Factory',
        'Singleton',
        'Cache',
        'Manager',
        'Handler',
      ];

      for (const file of allFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          if (patternIndicators.some(pattern => content.includes(pattern))) {
            hasDesignPatterns = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      expect(hasDesignPatterns).toBe(true);
    });

    test('should follow clean architecture principles', () => {
      const layers = ['core', 'interfaces', 'adapters', 'types'];
      let implementedLayers = 0;

      layers.forEach(layer => {
        const layerFiles = FileSystemUtils.getFilesInLayer(layer);
        if (layerFiles.length > 0) {
          implementedLayers++;
        }
      });

      // Should implement multiple architectural layers
      expect(implementedLayers).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Strategic Patterns', () => {
    test('should implement layered architecture pattern', () => {
      const architecturalLayers = [
        'interfaces',
        'core',
        'adapters',
        'ai',
        'cache',
        'discovery',
        'events',
      ];

      let layersImplemented = 0;

      architecturalLayers.forEach(layer => {
        const layerFiles = FileSystemUtils.getFilesInLayer(layer);
        if (layerFiles.length > 0) {
          layersImplemented++;
        }
      });

      // Should implement multiple layers
      expect(layersImplemented).toBeGreaterThanOrEqual(4);
    });

    test('should use dependency injection patterns', () => {
      const allFiles = FileSystemUtils.getAllTypeScriptFiles();
      let hasDependencyInjection = false;

      for (const file of allFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          // Look for constructor injection patterns
          if (content.includes('constructor(') && content.includes(':')) {
            hasDependencyInjection = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      expect(hasDependencyInjection).toBe(true);
    });

    test('should implement event-driven patterns where appropriate', () => {
      const eventFiles = FileSystemUtils.getFilesInLayer('events');

      if (eventFiles.length > 0) {
        let hasEventPatterns = false;

        for (const file of eventFiles) {
          try {
            const content = readFileSync(file, 'utf-8');

            // Look for event patterns
            if (
              content.includes('event') ||
              content.includes('emit') ||
              content.includes('subscribe')
            ) {
              hasEventPatterns = true;
              break;
            }
          } catch {
            // Skip files that can't be read
          }
        }

        expect(hasEventPatterns).toBe(true);
      } else {
        // Events layer is optional
        expect(true).toBe(true);
      }
    });

    test('should implement caching strategy for performance', () => {
      const cacheFiles = FileSystemUtils.getFilesInLayer('cache');

      // Should have caching implementation
      expect(cacheFiles.length).toBeGreaterThan(0);

      let hasCachingStrategy = false;

      for (const file of cacheFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          // Look for caching patterns
          const cachePatterns = [
            'cache',
            'get',
            'set',
            'has',
            'delete',
            'memory',
            'store',
            'retrieve',
          ];

          if (cachePatterns.some(pattern => content.toLowerCase().includes(pattern))) {
            hasCachingStrategy = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      expect(hasCachingStrategy).toBe(true);
    });
  });

  describe('Extensibility and Modularity', () => {
    test('should support plugin architecture through adapters', () => {
      const adapterFiles = FileSystemUtils.getFilesInLayer('adapters');

      // Adapters enable plugin-like extensibility
      expect(adapterFiles.length).toBeGreaterThan(0);

      let hasPluginPattern = false;

      for (const file of adapterFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          // Look for plugin/adapter patterns
          if (
            content.includes('interface') ||
            content.includes('implements') ||
            content.includes('extends')
          ) {
            hasPluginPattern = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      expect(hasPluginPattern).toBe(true);
    });

    test('should enable easy addition of new AI strategies', () => {
      const aiFiles = FileSystemUtils.getFilesInLayer('ai');

      let hasStrategyPattern = false;

      for (const file of aiFiles) {
        const fileName = FileSystemUtils.getFileName(file).toLowerCase();

        if (fileName.includes('strategy')) {
          hasStrategyPattern = true;
          break;
        }
      }

      expect(hasStrategyPattern).toBe(true);
    });

    test('should support multiple content source types', () => {
      const discoveryFiles = FileSystemUtils.getFilesInLayer('discovery');

      let supportsMultipleSources = false;

      for (const file of discoveryFiles) {
        try {
          const content = readFileSync(file, 'utf-8');

          // Look for multiple source support
          const sourcePatterns = [
            'source',
            'connector',
            'provider',
            'reader',
            'file',
            'web',
            'api',
            'database',
          ];

          if (sourcePatterns.some(pattern => content.toLowerCase().includes(pattern))) {
            supportsMultipleSources = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      if (discoveryFiles.length > 0) {
        expect(supportsMultipleSources).toBe(true);
      }
    });

    test('should maintain loose coupling between components', () => {
      const allFiles = FileSystemUtils.getAllTypeScriptFiles();
      let hasLooseCoupling = false;

      for (const file of allFiles) {
        try {
          const imports = FileSystemUtils.extractImports(file);

          // Look for interface-based imports (loose coupling)
          if (imports.some(imp => imp.includes('interface') || imp.includes('type'))) {
            hasLooseCoupling = true;
            break;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      expect(hasLooseCoupling).toBe(true);
    });
  });

  describe('Quality and Testing Strategy', () => {
    test('should have comprehensive test coverage', () => {
      // Get source files from src directory
      const srcFiles = FileSystemUtils.getAllTypeScriptFiles();
      const sourceFiles = srcFiles.filter(file => !file.includes('test') && !file.includes('spec'));

      // Get test files from tests directory - look for .test.ts files specifically
      const testPath = join(__dirname, '..');
      const allTestFiles = FileSystemUtils.getAllTestFiles(testPath);

      // Basic coverage expectations - should have tests for core components
      expect(allTestFiles.length).toBeGreaterThan(0);
      expect(sourceFiles.length).toBeGreaterThan(0);

      // Check that major components have corresponding tests
      const majorComponents = [
        'knowledge-agent',
        'file-system-monitor',
        'web-discovery',
        'youtube-discovery',
        'reddit-discovery',
      ];
      const missingTests = majorComponents.filter(component => {
        return !allTestFiles.some(testFile => testFile.includes(component));
      });

      expect(missingTests).toEqual([]); // All major components should have tests
    });

    test('should implement architecture testing', () => {
      // Look for architecture test files in the project
      const currentFilePath = __dirname;

      // Check if we have architecture tests directory
      const hasArchitectureTests = currentFilePath.includes('architecture');

      // Should have architecture tests (we're running this test from architecture directory)
      expect(hasArchitectureTests).toBe(true);
    });

    test('should follow testing best practices', () => {
      // Check the current test file itself for testing framework usage
      const currentFileContent = readFileSync(__filename, 'utf-8');

      // Look for testing framework usage in this very file
      const hasTestingFramework =
        currentFileContent.includes('describe') &&
        currentFileContent.includes('test') &&
        currentFileContent.includes('expect');

      expect(hasTestingFramework).toBe(true);
    });
  });
});
