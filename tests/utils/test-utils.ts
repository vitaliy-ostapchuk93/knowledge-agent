/**
 * Common test utilities
 * Shared utilities used across all test types (unit, integration, architecture, etc.)
 */

import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

// Common paths used across ALL tests
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

// Common file system utilities used across all test types
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
   * Check if file is a TypeScript file
   */
  static isTypeScriptFile(filename: string): boolean {
    return filename.endsWith('.ts') && !filename.endsWith('.d.ts');
  }

  /**
   * Get layer name from file path
   */
  static getLayerFromPath(filePath: string): string {
    const relativePath = filePath.replace(PATHS.srcDir, '').replace(/^[/\\]/, '');
    return relativePath.split(/[/\\]/)[0] || '';
  }

  /**
   * Get filename without path and extension
   */
  static getFileName(filePath: string): string {
    return filePath.split(/[/\\]/).pop() || '';
  }
}
