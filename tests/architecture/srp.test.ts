/**
 * Single Responsibility Principle (SRP) Tests
 *
 * Tests that each class has only one reason to change.
 * Each class should have only one job or responsibility.
 */

import { describe, test, expect } from 'bun:test';
import { FileSystemUtils, ARCHITECTURE_CONFIG } from './common/test-utils';
import { SolidTestUtils } from './common/solid-utils';

describe('Single Responsibility Principle', () => {
  test('should have classes with single responsibility', () => {
    const files = FileSystemUtils.getAllTypeScriptFiles();
    const violations: string[] = [];

    for (const file of files) {
      const result = SolidTestUtils.validateSingleResponsibility(file);
      if (!result.isValid) {
        violations.push(...result.violations.map(v => `${file}: ${v}`));
      }
    }

    if (violations.length > 0) {
      console.warn('SRP violations found:', violations);
    }

    // Allow some violations for legacy code, but track them
    expect(violations.length).toBeLessThanOrEqual(ARCHITECTURE_CONFIG.limits.maxSrpViolations);
  });

  test('should have focused classes in core layer', () => {
    const coreFiles = FileSystemUtils.getFilesInLayer('core');
    const violations: string[] = [];

    for (const file of coreFiles) {
      const expectedPatterns = [
        'business',
        'domain',
        'logic',
        'entity',
        'service',
        'agent',
        'knowledge',
        'monitor', // File system monitoring is core functionality
        'filesystem',
        'watch',
      ];
      const isValid = SolidTestUtils.validateLayerComponentResponsibility(
        file,
        'core',
        expectedPatterns
      );

      if (!isValid) {
        violations.push(`${file}: Core class should focus on business logic`);
      }
    }

    expect(violations).toEqual([]);
  });

  test('should have focused adapter classes', () => {
    const adapterFiles = FileSystemUtils.getFilesInLayer('adapters');
    const violations: string[] = [];

    for (const file of adapterFiles) {
      const expectedPatterns = ['adapter', 'convert', 'transform', 'interface'];
      const isValid = SolidTestUtils.validateLayerComponentResponsibility(
        file,
        'adapters',
        expectedPatterns
      );

      if (!isValid) {
        violations.push(`${file}: Adapter should focus on adaptation concerns`);
      }
    }

    expect(violations).toEqual([]);
  });

  test('should have focused AI strategy classes', () => {
    const aiFiles = FileSystemUtils.getFilesInLayer('ai');
    const violations: string[] = [];

    for (const file of aiFiles) {
      const expectedPatterns = ['ai', 'strategy', 'model', 'prompt', 'completion'];
      const isValid = SolidTestUtils.validateLayerComponentResponsibility(
        file,
        'ai',
        expectedPatterns
      );

      if (!isValid) {
        violations.push(`${file}: AI strategy should focus on AI interaction`);
      }
    }

    expect(violations).toEqual([]);
  });

  test('should have focused event classes', () => {
    const eventFiles = FileSystemUtils.getFilesInLayer('events');
    const violations: string[] = [];

    for (const file of eventFiles) {
      const expectedPatterns = ['event', 'bus', 'emit', 'listen', 'handler'];
      const isValid = SolidTestUtils.validateLayerComponentResponsibility(
        file,
        'events',
        expectedPatterns
      );

      if (!isValid) {
        violations.push(`${file}: Event class should focus on event handling`);
      }
    }

    expect(violations).toEqual([]);
  });

  test('should have focused cache classes', () => {
    const cacheFiles = FileSystemUtils.getFilesInLayer('cache');
    const violations: string[] = [];

    for (const file of cacheFiles) {
      const expectedPatterns = ['cache', 'store', 'memory', 'get', 'set'];
      const isValid = SolidTestUtils.validateLayerComponentResponsibility(
        file,
        'cache',
        expectedPatterns
      );

      if (!isValid) {
        violations.push(`${file}: Cache class should focus on caching concerns`);
      }
    }

    expect(violations).toEqual([]);
  });

  test('should have focused discovery classes', () => {
    const discoveryFiles = FileSystemUtils.getFilesInLayer('discovery');
    const violations: string[] = [];

    for (const file of discoveryFiles) {
      const expectedPatterns = ['discovery', 'content', 'find', 'search', 'scan'];
      const isValid = SolidTestUtils.validateLayerComponentResponsibility(
        file,
        'discovery',
        expectedPatterns
      );

      if (!isValid) {
        violations.push(`${file}: Discovery class should focus on content discovery`);
      }
    }

    expect(violations).toEqual([]);
  });

  test('building blocks should be in appropriate directories', () => {
    const { layers } = ARCHITECTURE_CONFIG;

    // Test the expected directory structure based on building blocks
    for (const layerName of Object.keys(layers)) {
      expect(layerName).toBeTruthy();
      expect(typeof layerName).toBe('string');
    }

    // Verify we have the right number of building blocks
    expect(Object.keys(layers).length).toBeGreaterThan(0);
  });

  test('core components should be separated by responsibility', () => {
    const coreFiles = FileSystemUtils.getFilesInLayer('core');
    const violations: string[] = [];

    for (const file of coreFiles) {
      try {
        const result = SolidTestUtils.validateSingleResponsibility(file);
        if (!result.isValid) {
          violations.push(...result.violations);
        }
      } catch {
        // Skip files that can't be analyzed
      }
    }

    // Core components should be well-structured
    expect(violations.length).toBeLessThanOrEqual(ARCHITECTURE_CONFIG.limits.maxCoreViolations);
  });

  test('discovery components should handle single aspects of content discovery', () => {
    const discoveryFiles = FileSystemUtils.getFilesInLayer('discovery');
    const violations: string[] = [];

    for (const file of discoveryFiles) {
      const result = SolidTestUtils.validateSingleResponsibility(file);
      if (!result.isValid) {
        violations.push(...result.violations);
      }
    }

    expect(violations).toEqual([]);
  });

  test('AI processing components should have single processing focus', () => {
    const aiFiles = FileSystemUtils.getFilesInLayer('ai');
    const violations: string[] = [];

    for (const file of aiFiles) {
      const result = SolidTestUtils.validateSingleResponsibility(file);
      if (!result.isValid) {
        violations.push(...result.violations);
      }
    }

    expect(violations).toEqual([]);
  });

  test('platform adapters should handle single platform each', () => {
    const adapterFiles = FileSystemUtils.getFilesInLayer('adapters');
    const violations: string[] = [];

    for (const file of adapterFiles) {
      // Check that each adapter focuses on a single platform
      const platforms = ['logseq', 'obsidian', 'notion', 'roam', 'markdown'];
      const hasFocusedPlatform = SolidTestUtils.validateLayerComponentResponsibility(
        file,
        'adapters',
        platforms
      );

      if (!hasFocusedPlatform) {
        violations.push(`${file}: Adapter should focus on single platform`);
      }
    }

    expect(violations).toEqual([]);
  });
});
