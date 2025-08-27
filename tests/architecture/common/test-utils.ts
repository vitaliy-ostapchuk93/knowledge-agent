/**
 * Common utilities for architecture tests
 *
 * This module provides shared functions and configurations for architecture testing,
 * making tests more maintainable and reducing code duplication.
 */

import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

// Common paths used across tests
export const PATHS = {
  rootDir: process.cwd(),
  srcDir: join(process.cwd(), 'src'),
  testsDir: join(process.cwd(), 'tests'),
  testDataDir: join(process.cwd(), 'tests', 'data'),
  interfacesDir: join(process.cwd(), 'src', 'interfaces'),
  typesDir: join(process.cwd(), 'src', 'types'),
  coreDir: join(process.cwd(), 'src', 'core'),
  discoveryDir: join(process.cwd(), 'src', 'discovery'),
  aiDir: join(process.cwd(), 'src', 'ai'),
  cacheDir: join(process.cwd(), 'src', 'cache'),
  eventsDir: join(process.cwd(), 'src', 'events'),
  adaptersDir: join(process.cwd(), 'src', 'adapters'),
};

// Configuration based on building blocks documentation
export const ARCHITECTURE_CONFIG = {
  // Layer definitions from building blocks
  layers: {
    core: 'core',
    discovery: 'discovery',
    ai: 'ai',
    integration: 'integration',
    adapters: 'adapters',
    cache: 'cache',
    events: 'events',
    interfaces: 'interfaces',
    types: 'types',
  },

  // Dependency rules from architecture documentation
  dependencies: {
    core: ['discovery', 'ai', 'integration', 'interfaces', 'types'],
    discovery: ['cache', 'interfaces', 'types'],
    ai: ['cache', 'interfaces', 'types'],
    integration: ['cache', 'interfaces', 'types'],
    adapters: ['interfaces', 'types'],
    cache: ['interfaces', 'types'],
    events: ['interfaces', 'types'],
    interfaces: ['types'],
    types: [],
  },

  // External dependencies that should be abstracted
  externalApis: [
    'axios',
    'fetch',
    'openai',
    'youtube',
    'reddit',
    'cheerio',
    'snoowrap',
    '@octokit',
  ],

  // Files that are allowed to have external dependencies
  externalDependencyPatterns: ['adapter', 'strategy', 'connector'],

  // Naming conventions
  naming: {
    interfaces: /^[a-z-]+\.ts$/, // kebab-case interface files
    adapters: /[Aa]dapter/,
    strategies: /[Ss]trategy/,
  },

  // Limits and thresholds
  limits: {
    maxMethodsPerClass: 10,
    maxInterfacesPerImplementation: 3,
    maxMethodsPerInterface: 8,
    maxSrpViolations: 5,
    maxCoreViolations: 3,
    maxDependenciesPerFile: 15,
    maxFileSize: 500, // lines
  },
};

// Common file system utilities
export class FileSystemUtils {
  /**
   * Get all TypeScript files in the workspace
   */
  static getAllTypeScriptFiles(): string[] {
    return this.getAllTypeScriptFilesInDir(PATHS.srcDir);
  }

  /**
   * Get all TypeScript files in a directory recursively
   */
  static getAllTypeScriptFilesInDir(dir: string): string[] {
    const files: string[] = [];

    try {
      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          files.push(...this.getAllTypeScriptFilesInDir(fullPath));
        } else if (this.isTypeScriptFile(item)) {
          files.push(fullPath);
        }
      }
    } catch {
      // Directory might not exist yet
    }

    return files;
  }

  /**
   * Get files in a specific layer
   */
  static getFilesInLayer(layerName: string): string[] {
    const layerPath = join(PATHS.srcDir, layerName);
    return this.getAllTypeScriptFilesInDir(layerPath);
  }

  /**
   * Extract imports from a TypeScript file
   */
  static extractImports(filePath: string): string[] {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const importMatches = content.match(/import.*from\s+['"`]([^'"`]+)['"`]/g) || [];
      return importMatches
        .map(match => {
          const parts = match.match(/from\s+['"`]([^'"`]+)['"`]/);
          return parts ? parts[1] : '';
        })
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  /**
   * Get all test files in a directory recursively
   */
  static getAllTestFiles(dir: string): string[] {
    const files: string[] = [];

    try {
      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          files.push(...this.getAllTestFiles(fullPath));
        } else if (this.isTestFile(item)) {
          files.push(fullPath);
        }
      }
    } catch {
      // Directory might not exist yet
    }

    return files;
  }

  /**
   * Check if file is a test file
   */
  static isTestFile(filename: string): boolean {
    return filename.endsWith('.test.ts') || filename.endsWith('.spec.ts');
  }

  /**
   * Check if file is a TypeScript file (excluding tests and declarations)
   */
  static isTypeScriptFile(filename: string): boolean {
    return (
      filename.endsWith('.ts') && !filename.endsWith('.test.ts') && !filename.endsWith('.d.ts')
    );
  }

  /**
   * Get the layer name from a file path
   */
  static getLayerFromPath(filePath: string): string {
    const relativePath = filePath.replace(PATHS.srcDir, '').replace(/\\/g, '/');
    const parts = relativePath.split('/').filter(Boolean);
    return parts[0] || '';
  }

  /**
   * Get filename without path and extension
   */
  static getFileName(filePath: string): string {
    return filePath.split(/[/\\]/).pop() || '';
  }
}

// Common validation utilities
export class ValidationUtils {
  /**
   * Check if imports violate layer dependencies
   */
  static validateLayerDependencies(
    layer: string,
    imports: string[],
    allowedDependencies: string[]
  ): string[] {
    const forbiddenLayers = Object.keys(ARCHITECTURE_CONFIG.layers).filter(
      l => l !== layer && !allowedDependencies.includes(l)
    );

    return imports.filter(
      imp => imp.startsWith('../') && forbiddenLayers.some(forbidden => imp.includes(forbidden))
    );
  }

  /**
   * Check if file should be allowed to have external dependencies
   */
  static isExternalDependencyAllowed(filePath: string): boolean {
    return ARCHITECTURE_CONFIG.externalDependencyPatterns.some(pattern =>
      filePath.toLowerCase().includes(pattern)
    );
  }

  /**
   * Find external API dependencies in imports
   */
  static findExternalApiDependencies(imports: string[]): string[] {
    return imports.filter(imp => ARCHITECTURE_CONFIG.externalApis.some(api => imp.includes(api)));
  }

  /**
   * Validate naming convention
   */
  static validateNaming(filename: string, pattern: RegExp): boolean {
    return pattern.test(filename);
  }
}

// Common test assertion utilities
export class TestUtils {
  /**
   * Assert no forbidden dependencies
   */
  static assertNoDependencies(badImports: string[], context: string = 'Dependencies'): void {
    if (badImports.length > 0) {
      throw new Error(`${context} violation found: ${badImports.join(', ')}`);
    }
  }

  /**
   * Assert naming convention
   */
  static assertNamingConvention(filename: string, pattern: RegExp, description: string): void {
    if (!ValidationUtils.validateNaming(filename, pattern)) {
      throw new Error(`Naming convention violation: "${filename}" should ${description}`);
    }
  }

  /**
   * Assert external dependency is properly abstracted
   */
  static assertExternalDependencyAbstraction(filePath: string, externalImports: string[]): void {
    if (externalImports.length > 0 && !ValidationUtils.isExternalDependencyAllowed(filePath)) {
      throw new Error(
        `External dependencies should be abstracted through adapters/strategies. ` +
          `Found: ${externalImports.join(', ')} in ${filePath}`
      );
    }
  }
}

// Pattern-specific test utilities
export class PatternTestUtils {
  /**
   * Validate SOLID principle compliance
   */
  static validateSolidPrinciple(
    principle: string,
    files: string[],
    validationFn: (file: string) => boolean | string[]
  ): void {
    for (const file of files) {
      const result = validationFn(file);
      if (typeof result === 'boolean' && !result) {
        throw new Error(`${principle} violation in ${file}`);
      } else if (Array.isArray(result) && result.length > 0) {
        throw new Error(`${principle} violation in ${file}: ${result.join(', ')}`);
      }
    }
  }

  /**
   * Validate design pattern implementation
   */
  static validateDesignPattern(
    pattern: string,
    expectedFeatures: string[],
    actualFeatures: string[]
  ): void {
    const missingFeatures = expectedFeatures.filter(feature => !actualFeatures.includes(feature));

    if (missingFeatures.length > 0) {
      throw new Error(`${pattern} pattern incomplete. Missing: ${missingFeatures.join(', ')}`);
    }
  }
}
