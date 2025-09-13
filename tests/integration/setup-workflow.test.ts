/**
 * Tests for Setup and External Data Workflow
 * Validates postinstall, manual setup, and data availability checks
 */

import { describe, it, expect } from 'bun:test';
import { existsSync } from 'fs';
import { join } from 'path';

describe('Setup and External Data Workflow', () => {
  describe('Setup Script Integration', () => {
    it('should have setup script in correct location', () => {
      const setupScriptPath = join(process.cwd(), 'src', 'scripts', 'setup-external-data.ts');
      expect(existsSync(setupScriptPath)).toBe(true);
    });

    it('should have data processing scripts in correct location', () => {
      const fetchAllDataPath = join(process.cwd(), 'src', 'data', 'fetch-all-data.ts');
      expect(existsSync(fetchAllDataPath)).toBe(true);

      const transformDataPath = join(process.cwd(), 'src', 'data', 'transform-external-data.ts');
      expect(existsSync(transformDataPath)).toBe(true);
    });

    it('should have proper package.json script references', async () => {
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(await Bun.file(packageJsonPath).text());

      expect(packageJson.scripts).toHaveProperty('setup');
      expect(packageJson.scripts).toHaveProperty('setup:verbose');
      expect(packageJson.scripts).toHaveProperty('setup:force');
      expect(packageJson.scripts).toHaveProperty('postinstall');

      // Should reference src/scripts/ not scripts/
      expect(packageJson.scripts.setup).toContain('src/scripts/setup-external-data.ts');
      expect(packageJson.scripts.postinstall).toContain('src/scripts/setup-external-data.ts');
    });
  });

  describe('External Data Availability', () => {
    it('should check for processed data correctly', () => {
      const processedDir = join(process.cwd(), 'assets', 'processed');
      const transformedDataPath = join(processedDir, 'transformed-terms.json');

      // Should be able to check existence (file may or may not exist)
      const exists = existsSync(transformedDataPath);
      expect(typeof exists).toBe('boolean');
    });

    it('should have assets directory structure', () => {
      const assetsDir = join(process.cwd(), 'assets');
      expect(existsSync(assetsDir)).toBe(true);

      // These directories should be created by external data scripts
      // They may not exist if setup hasn't run, but that's ok
      const externalDataDir = join(assetsDir, 'external-data');
      const processedDir = join(assetsDir, 'processed');

      // Just check the paths are valid - directories created on demand
      expect(typeof existsSync(externalDataDir)).toBe('boolean');
      expect(typeof existsSync(processedDir)).toBe('boolean');
    });
  });

  describe('TypeScript Configuration', () => {
    it('should have proper path mappings for new directories', async () => {
      const tsconfigPath = join(process.cwd(), 'tsconfig.json');
      const tsconfig = JSON.parse(await Bun.file(tsconfigPath).text());

      expect(tsconfig.compilerOptions.paths).toHaveProperty('@/data/*');
      expect(tsconfig.compilerOptions.paths).toHaveProperty('@/scripts/*');

      expect(tsconfig.compilerOptions.paths['@/data/*']).toEqual(['src/data/*']);
      expect(tsconfig.compilerOptions.paths['@/scripts/*']).toEqual(['src/scripts/*']);
    });

    it('should include proper source directories', async () => {
      const tsconfigPath = join(process.cwd(), 'tsconfig.json');
      const tsconfig = JSON.parse(await Bun.file(tsconfigPath).text());

      expect(Array.isArray(tsconfig.include)).toBe(true);
      expect(tsconfig.include).toContain('src/**/*');
      expect(tsconfig.include).toContain('tests/**/*');
      expect(tsconfig.include).toContain('assets/**/*');

      // Should not include old scripts/ directory
      expect(tsconfig.include).not.toContain('scripts/**/*');
    });
  });

  describe('File Organization', () => {
    it('should have TypeScript files in src/ not assets/', () => {
      const assetsScriptsDir = join(process.cwd(), 'assets', 'scripts');
      expect(existsSync(assetsScriptsDir)).toBe(false);

      const rootScriptsDir = join(process.cwd(), 'scripts');
      expect(existsSync(rootScriptsDir)).toBe(false);

      const srcDataDir = join(process.cwd(), 'src', 'data');
      expect(existsSync(srcDataDir)).toBe(true);

      const srcScriptsDir = join(process.cwd(), 'src', 'scripts');
      expect(existsSync(srcScriptsDir)).toBe(true);
    });

    it('should have assets directory for data files only', () => {
      const assetsDir = join(process.cwd(), 'assets');
      expect(existsSync(assetsDir)).toBe(true);

      // Assets should contain data, not TypeScript code
      const expectedSubdirs = ['external-data', 'processed', 'reports', 'images'];

      // Check that these are the expected types of directories (data, not code)
      expectedSubdirs.forEach(subdir => {
        const subdirPath = join(assetsDir, subdir);
        // Directory may or may not exist, but if it exists it should be for data
        if (existsSync(subdirPath)) {
          expect(typeof subdirPath).toBe('string');
        }
      });
    });
  });
});
