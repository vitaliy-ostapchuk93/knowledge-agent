/**
 * Portability and Compatibility Architecture Tests
 *
 * Tests for portability and compatibility quality attributes as defined in docs/quality-model.md
 * Based on ISO 25010 quality model - Portability and Compatibility
 */

import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { FileSystemUtils } from '../common/test-utils';

describe('Portability Architecture', () => {
  test('should avoid platform-specific dependencies', () => {
    const allFiles = FileSystemUtils.getAllTypeScriptFiles();
    const violations: string[] = [];

    // Look for platform-specific patterns
    const platformSpecificPatterns = [
      'process.platform',
      '__dirname',
      '__filename',
      'fs.sync',
      'path.win32',
      'path.posix',
    ];

    for (const file of allFiles) {
      try {
        const content = readFileSync(file, 'utf-8');

        for (const pattern of platformSpecificPatterns) {
          if (content.includes(pattern)) {
            violations.push(`${file}: uses ${pattern}`);
          }
        }
      } catch {
        // Skip files that can't be read
      }
    }

    // Should have minimal platform-specific code
    expect(violations.length).toBeLessThanOrEqual(3);
  });

  test('should use standard APIs and protocols', () => {
    const allFiles = FileSystemUtils.getAllTypeScriptFiles();
    let hasStandardApis = false;

    const standardPatterns = ['fetch', 'Promise', 'async', 'await', 'JSON', 'URL'];

    for (const file of allFiles) {
      try {
        const content = readFileSync(file, 'utf-8');
        const hasStandard = standardPatterns.some(pattern => content.includes(pattern));

        if (hasStandard) {
          hasStandardApis = true;
          break;
        }
      } catch {
        // Skip files that can't be read
      }
    }

    expect(hasStandardApis).toBe(true);
  });
});

describe('Compatibility Architecture', () => {
  test('should maintain interface compatibility', () => {
    const interfaceFiles = FileSystemUtils.getFilesInLayer('interfaces');
    let hasVersionedInterfaces = false;

    for (const file of interfaceFiles) {
      try {
        const content = readFileSync(file, 'utf-8');

        // Look for compatibility patterns
        if (
          content.includes('version') ||
          content.includes('deprecated') ||
          content.includes('optional') ||
          content.includes('?:')
        ) {
          hasVersionedInterfaces = true;
          break;
        }
      } catch {
        // Skip files that can't be read
      }
    }

    // Interfaces should consider compatibility
    expect(hasVersionedInterfaces).toBe(true);
  });

  test('should handle different data formats', () => {
    const discoveryFiles = FileSystemUtils.getFilesInLayer('discovery');
    let hasFormatHandling = false;

    const formatPatterns = ['JSON', 'parse', 'stringify', 'format', 'transform', 'convert'];

    for (const file of discoveryFiles) {
      try {
        const content = readFileSync(file, 'utf-8');
        const hasFormat = formatPatterns.some(pattern => content.includes(pattern));

        if (hasFormat) {
          hasFormatHandling = true;
          break;
        }
      } catch {
        // Skip files that can't be read
      }
    }

    expect(hasFormatHandling).toBe(true);
  });
});

describe('Functional Suitability Architecture', () => {
  test('should implement core knowledge management functions', () => {
    const coreFiles = FileSystemUtils.getFilesInLayer('core');

    // Should have core knowledge management components
    expect(coreFiles.length).toBeGreaterThan(0);

    let hasKnowledgeFunctions = false;

    for (const file of coreFiles) {
      try {
        const content = readFileSync(file, 'utf-8');
        if (
          content.includes('knowledge') ||
          content.includes('agent') ||
          content.includes('process')
        ) {
          hasKnowledgeFunctions = true;
          break;
        }
      } catch {
        // Skip files that can't be read
      }
    }

    expect(hasKnowledgeFunctions).toBe(true);
  });

  test('should provide content discovery capabilities', () => {
    const discoveryFiles = FileSystemUtils.getFilesInLayer('discovery');

    // Should have discovery components
    expect(discoveryFiles.length).toBeGreaterThan(0);
  });

  test('should integrate AI processing capabilities', () => {
    const aiFiles = FileSystemUtils.getFilesInLayer('ai');

    // Should have AI components
    expect(aiFiles.length).toBeGreaterThan(0);
  });
});
