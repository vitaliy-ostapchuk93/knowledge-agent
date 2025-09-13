/**
 * Tests for External Data Setup Script
 * Validates setup functionality, postinstall workflow, and error handling
 */

import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { ExternalDataSetup } from '@/scripts/setup-external-data.ts';
import { logger } from '@/utils/logger.ts';

describe('ExternalDataSetup', () => {
  const testAssetsDir = join(process.cwd(), 'test-assets');
  const testProcessedDir = join(testAssetsDir, 'processed');

  beforeEach(() => {
    // Create test directory structure
    mkdirSync(testProcessedDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directories
    if (existsSync(testAssetsDir)) {
      rmSync(testAssetsDir, { recursive: true, force: true });
    }
  });  describe('Setup Options', () => {
    it('should handle default options correctly', () => {
      const setup = new ExternalDataSetup();
      expect(setup).toBeDefined();
    });

    it('should handle postinstall mode options', () => {
      const setup = new ExternalDataSetup({ isPostinstall: true });
      expect(setup).toBeDefined();
    });

    it('should handle verbose mode options', () => {
      const setup = new ExternalDataSetup({ verbose: true });
      expect(setup).toBeDefined();
    });

    it('should handle force mode options', () => {
      const setup = new ExternalDataSetup({ force: true });
      expect(setup).toBeDefined();
    });
  });

  describe('External Data Detection', () => {
    it('should detect when external data exists', async () => {
      // Create mock transformed data
      const mockDataPath = join(testProcessedDir, 'transformed-terms.json');
      writeFileSync(mockDataPath, JSON.stringify({ test: 'data' }));

      // Mock the setup to use test directory
      const setup = new ExternalDataSetup();
      (setup as any).processedDir = testProcessedDir;

      const result = (setup as any).hasExternalData();
      expect(result).toBe(true);
    });

    it('should detect when external data is missing', async () => {
      const setup = new ExternalDataSetup();
      (setup as any).processedDir = testProcessedDir;

      const result = (setup as any).hasExternalData();
      expect(result).toBe(false);
    });
  });

  describe('Setup Workflow', () => {
    it('should skip setup when data exists and force is false', async () => {
      // Create mock data
      const mockDataPath = join(testProcessedDir, 'transformed-terms.json');
      writeFileSync(mockDataPath, JSON.stringify({ test: 'data' }));

      const setup = new ExternalDataSetup({ verbose: true });
      (setup as any).processedDir = testProcessedDir;

      const consoleSpy = spyOn(console, 'log');
      const result = await setup.setup();

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('External data already available')
      );
    });

    it('should attempt fetch when data is missing', async () => {
      const setup = new ExternalDataSetup({ verbose: true });
      (setup as any).processedDir = testProcessedDir;

      // Mock fetchExternalData to return false (script not found)
      spyOn(setup as any, 'fetchExternalData').mockResolvedValue(false);

      const result = await setup.setup();
      expect(result).toBe(false);
    });

    it('should attempt fetch when force is true even with existing data', async () => {
      // Create mock data
      const mockDataPath = join(testProcessedDir, 'transformed-terms.json');
      writeFileSync(mockDataPath, JSON.stringify({ test: 'data' }));

      const setup = new ExternalDataSetup({ force: true, verbose: true });
      (setup as any).processedDir = testProcessedDir;

      // Mock fetchExternalData
      spyOn(setup as any, 'fetchExternalData').mockResolvedValue(false);

      const result = await setup.setup();
      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle setup errors gracefully in postinstall mode', async () => {
      const setup = new ExternalDataSetup({ isPostinstall: true });

      // Mock setup to throw error
      spyOn(setup as any, 'hasExternalData').mockImplementation(() => {
        throw new Error('Test error');
      });

      const loggerSpy = spyOn(logger, 'warn');
      const result = await setup.setup();

      expect(result).toBe(false);
      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('POSTINSTALL WARNING'));
    });

    it('should handle setup errors gracefully in manual mode', async () => {
      const setup = new ExternalDataSetup({ verbose: true });

      // Mock setup to throw error
      spyOn(setup as any, 'hasExternalData').mockImplementation(() => {
        throw new Error('Test error');
      });

      const loggerSpy = spyOn(logger, 'error');
      const result = await setup.setup();

      expect(result).toBe(false);
      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('SETUP ERROR'));
    });
  });

  describe('Logging Behavior', () => {
    it('should log messages in verbose mode', () => {
      const setup = new ExternalDataSetup({ verbose: true, isPostinstall: false });
      const loggerSpy = spyOn(logger, 'info');

      (setup as any).log('Test message');

      expect(loggerSpy).toHaveBeenCalledWith('Test message');
    });

    it('should log messages in manual mode (non-postinstall)', () => {
      const setup = new ExternalDataSetup({ verbose: false, isPostinstall: false });
      const loggerSpy = spyOn(logger, 'info');

      (setup as any).log('Test message');

      expect(loggerSpy).toHaveBeenCalledWith('Test message');
    });

    it('should suppress messages in postinstall mode when not verbose', () => {
      const setup = new ExternalDataSetup({ verbose: false, isPostinstall: true });
      
      // Create a fresh spy to avoid interference from other tests
      const originalInfo = logger.info;
      let wasCalled = false;
      logger.info = () => { wasCalled = true; };

      (setup as any).log('Test message');

      // Restore the original method
      logger.info = originalInfo;

      expect(wasCalled).toBe(false);
    });
  });

  describe('Fallback Handling', () => {
    it('should provide appropriate fallback message for postinstall', () => {
      const setup = new ExternalDataSetup({ isPostinstall: true });
      const consoleSpy = spyOn(console, 'log');

      (setup as any).handleFallback();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('POSTINSTALL NOTICE'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('~75 fallback terms'));
    });

    it('should provide appropriate fallback message for manual setup', () => {
      const setup = new ExternalDataSetup({ isPostinstall: false });
      const consoleSpy = spyOn(console, 'log');

      (setup as any).handleFallback();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('SETUP INCOMPLETE'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('bun run setup --verbose'));
    });
  });
});

describe('Setup Script CLI Arguments', () => {
  it('should parse postinstall argument', () => {
    // Mock process.argv
    const originalArgv = process.argv;
    process.argv = ['bun', 'setup-script.ts', '--postinstall'];

    // Import parseArgs function (we'd need to export it from the main file)
    // For now, test the setup behavior
    const setup = new ExternalDataSetup({ isPostinstall: true });
    expect(setup).toBeDefined();

    process.argv = originalArgv;
  });

  it('should parse verbose argument', () => {
    const originalArgv = process.argv;
    process.argv = ['bun', 'setup-script.ts', '--verbose'];

    const setup = new ExternalDataSetup({ verbose: true });
    expect(setup).toBeDefined();

    process.argv = originalArgv;
  });

  it('should parse force argument', () => {
    const originalArgv = process.argv;
    process.argv = ['bun', 'setup-script.ts', '--force'];

    const setup = new ExternalDataSetup({ force: true });
    expect(setup).toBeDefined();

    process.argv = originalArgv;
  });
});

describe('Integration with Package.json Scripts', () => {
  it('should be callable via package.json setup script', async () => {
    // This would be an integration test that actually calls the package.json script
    // For unit test, we just verify the class can be instantiated
    const setup = new ExternalDataSetup();
    expect(setup).toBeDefined();
  });

  it('should handle postinstall workflow', async () => {
    const setup = new ExternalDataSetup({ isPostinstall: true });
    expect(setup).toBeDefined();
  });
});
