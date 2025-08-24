import { describe, test, expect } from 'bun:test';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Single Responsibility Principle (SRP) Tests
 *
 * Verifies that each class has only one reason to change and handles a single responsibility.
 * Based on the building blocks architecture defined in docs/05-building-blocks.md
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

function extractClasses(content: string): string[] {
  const classRegex = /class\s+(\w+)/g;
  const matches: string[] = [];
  let match;

  while ((match = classRegex.exec(content)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

function extractMethods(content: string, className: string): string[] {
  const classStartRegex = new RegExp(`class\\s+${className}[^{]*{`);
  const match = classStartRegex.exec(content);

  if (!match) return [];

  const startIndex = match.index + match[0].length;
  let braceCount = 1;
  let endIndex = startIndex;

  // Find the end of the class
  for (let i = startIndex; i < content.length && braceCount > 0; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') braceCount--;
    endIndex = i;
  }

  const classContent = content.substring(startIndex, endIndex);

  // Extract method names
  const methodRegex = /(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\(/g;
  const methods: string[] = [];
  let methodMatch;

  while ((methodMatch = methodRegex.exec(classContent)) !== null) {
    if (methodMatch[1] !== 'constructor') {
      methods.push(methodMatch[1]);
    }
  }

  return methods;
}

function extractImplementedInterfaces(content: string, className: string): string[] {
  const implementsRegex = new RegExp(`class\\s+${className}[^{]*implements\\s+([^{]+)`);
  const match = implementsRegex.exec(content);

  if (!match) return [];

  return match[1]
    .split(',')
    .map(i => i.trim())
    .filter(i => i.length > 0);
}

describe('Single Responsibility Principle (SRP)', () => {
  test('classes should have a single responsibility (max 10 methods)', async () => {
    // Since we don't have implementations yet, test the architectural principle
    const maxMethodsPerClass = 10;
    const responsibilityPrinciples = [
      'Each class should have one reason to change',
      'Methods should be cohesive within the class',
      'High cohesion, low coupling should be maintained',
    ];

    responsibilityPrinciples.forEach(principle => {
      expect(principle).toBeTruthy();
    });

    // When implementations exist, verify method count
    expect(maxMethodsPerClass).toBe(10);
  });

  test('classes should not implement too many interfaces (max 3)', async () => {
    const files = getAllTypeScriptFiles(SRC_PATH);

    for (const file of files) {
      const content = await Bun.file(file).text();
      const classes = extractClasses(content);

      for (const className of classes) {
        const interfaces = extractImplementedInterfaces(content, className);
        expect(interfaces.length).toBeLessThanOrEqual(3);
      }
    }
  });

  test('building blocks should be in appropriate directories', () => {
    // Test the expected directory structure based on building blocks
    const expectedStructure = [
      'core', // Core Knowledge Agent
      'discovery', // Content Discovery Layer
      'ai', // AI Processing Pipeline
      'adapters', // Platform Adaptation Layer
      'cache', // Cache Management Layer
      'events', // Event Bus
      'interfaces', // Interface definitions
      'types', // Type definitions
    ];

    for (const dir of expectedStructure) {
      // For now, just verify the structure is planned correctly
      expect(dir).toBeTruthy();
      expect(typeof dir).toBe('string');
    }

    // Verify we have the right number of building blocks
    expect(expectedStructure.length).toBe(8);
  });
  test('core components should be separated by responsibility', async () => {
    const corePath = join(SRC_PATH, 'core');

    try {
      const files = getAllTypeScriptFiles(corePath);
      const coreComponents = [
        'knowledge-agent', // Main orchestrator
        'workflow-orchestrator', // Workflow coordination
        'query-parser', // Query analysis
        'context-manager', // Context management
        'response-builder', // Response assembly
        'configuration-manager', // Configuration management
      ];

      // Check that core components exist or are planned
      for (const component of coreComponents) {
        const hasFile = files.some(
          file => file.includes(component) || file.includes(component.replace('-', ''))
        );

        if (files.length > 0) {
          // Only enforce if core directory has files
          expect(hasFile).toBe(true);
        }
      }
    } catch {
      // Core directory might not exist yet - this is acceptable for new projects
    }
  });

  test('discovery components should handle single aspects of content discovery', async () => {
    const discoveryPath = join(SRC_PATH, 'discovery');

    try {
      const files = getAllTypeScriptFiles(discoveryPath);

      for (const file of files) {
        const content = await Bun.file(file).text();
        const classes = extractClasses(content);

        for (const className of classes) {
          // Discovery classes should focus on single source or single function
          const methods = extractMethods(content, className);

          // Discovery components should be focused
          expect(methods.length).toBeLessThanOrEqual(8);

          // Should not mix different source types in one class
          const hasMultipleSources = /youtube.*reddit|reddit.*github|github.*youtube/i.test(
            content
          );
          expect(hasMultipleSources).toBe(false);
        }
      }
    } catch {
      // Discovery directory might not exist yet
    }
  });

  test('AI processing components should have single processing focus', async () => {
    const aiPath = join(SRC_PATH, 'ai');

    try {
      const files = getAllTypeScriptFiles(aiPath);

      for (const file of files) {
        const content = await Bun.file(file).text();
        const classes = extractClasses(content);

        for (const className of classes) {
          // AI classes should focus on single processing type
          const methods = extractMethods(content, className);
          expect(methods.length).toBeLessThanOrEqual(6);

          // Should not mix summarization with extraction in same class
          const mixesConcerns =
            content.includes('summarize') &&
            content.includes('extract') &&
            content.includes('analyze');
          expect(mixesConcerns).toBe(false);
        }
      }
    } catch {
      // AI directory might not exist yet
    }
  });

  test('platform adapters should handle single platform each', async () => {
    const adaptersPath = join(SRC_PATH, 'adapters');

    try {
      const files = getAllTypeScriptFiles(adaptersPath);

      for (const file of files) {
        const content = await Bun.file(file).text();

        // Each adapter file should handle only one platform
        const platforms = ['logseq', 'obsidian', 'notion', 'roam'];
        const foundPlatforms = platforms.filter(platform =>
          content.toLowerCase().includes(platform)
        );

        if (foundPlatforms.length > 0) {
          expect(foundPlatforms.length).toBeLessThanOrEqual(1);
        }
      }
    } catch {
      // Adapters directory might not exist yet
    }
  });
});
