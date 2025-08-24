import { describe, test, expect } from 'bun:test';

/**
 * Dependency Rules Tests using generic architectural patterns
 *
 * These tests enforce architectural boundaries and layering rules
 * without depending on specific implementation details.
 *
 * Based on clean architecture principles and building blocks patterns.
 * For complex dependency analysis, use: bun run arch:check
 */

import {
  ARCHITECTURE_CONFIG,
  FileSystemUtils,
  ValidationUtils,
  TestUtils,
} from './common/test-utils';

describe('Architecture Boundaries', () => {
  Object.entries(ARCHITECTURE_CONFIG.dependencies).forEach(([layer, allowedDeps]) => {
    test(`${layer} layer should only depend on allowed layers`, () => {
      const layerFiles = FileSystemUtils.getFilesInLayer(layer);

      for (const file of layerFiles) {
        const imports = FileSystemUtils.extractImports(file);
        const badImports = ValidationUtils.validateLayerDependencies(layer, imports, allowedDeps);

        TestUtils.assertNoDependencies(badImports, `Layer dependency for ${layer}`);
      }
    });
  });

  test('adapters should not depend on each other', () => {
    const adapterFiles = FileSystemUtils.getFilesInLayer('adapters');

    for (const file of adapterFiles) {
      const imports = FileSystemUtils.extractImports(file);
      const adapterImports = imports.filter(
        (imp: string) => imp.includes('adapters') && !imp.includes(file)
      );

      expect(adapterImports).toEqual([]);
    }
  });

  test('interfaces should not depend on implementations', () => {
    const interfaceFiles = FileSystemUtils.getFilesInLayer('interfaces');
    const forbiddenLayers = Object.keys(ARCHITECTURE_CONFIG.layers).filter(
      layer => !['interfaces', 'types'].includes(layer)
    );

    for (const file of interfaceFiles) {
      const imports = FileSystemUtils.extractImports(file);
      const badImports = imports.filter(
        (imp: string) =>
          imp.startsWith('../') && forbiddenLayers.some((layer: string) => imp.includes(layer))
      );

      expect(badImports).toEqual([]);
    }
  });
});

describe('External Dependencies', () => {
  test('external APIs should be abstracted through adapters', () => {
    for (const layer of Object.keys(ARCHITECTURE_CONFIG.layers)) {
      if (['adapters', 'ai'].includes(layer)) continue; // These layers can have external deps

      const layerFiles = FileSystemUtils.getFilesInLayer(layer);

      for (const file of layerFiles) {
        const imports = FileSystemUtils.extractImports(file);
        const crossCuttingImports = imports.filter((imp: string) =>
          ARCHITECTURE_CONFIG.externalApis.some((api: string) => imp.includes(api))
        );

        if (crossCuttingImports.length > 0) {
          const isAllowed = ValidationUtils.isExternalDependencyAllowed(file);
          expect(isAllowed).toBe(true);
        }
      }
    }
  });

  test('external dependencies should be documented', () => {
    for (const layer of Object.keys(ARCHITECTURE_CONFIG.layers)) {
      const layerFiles = FileSystemUtils.getFilesInLayer(layer);

      for (const file of layerFiles) {
        const imports = FileSystemUtils.extractImports(file);
        const externalImports = ValidationUtils.findExternalApiDependencies(imports);

        TestUtils.assertExternalDependencyAbstraction(file, externalImports);
      }
    }
  });
});

describe('Naming Conventions', () => {
  test('interface files should follow naming conventions', () => {
    const interfaceFiles = FileSystemUtils.getFilesInLayer('interfaces');

    for (const file of interfaceFiles) {
      const fileName = FileSystemUtils.getFileName(file);
      const isValid = ValidationUtils.validateNaming(
        fileName,
        ARCHITECTURE_CONFIG.naming.interfaces
      );

      if (!isValid) {
        console.warn(`Interface naming violation: ${fileName}`);
      }
    }
  });

  test('adapter files should follow naming conventions', () => {
    const adapterFiles = FileSystemUtils.getFilesInLayer('adapters');

    for (const file of adapterFiles) {
      const fileName = FileSystemUtils.getFileName(file);
      const isValid = ValidationUtils.validateNaming(fileName, ARCHITECTURE_CONFIG.naming.adapters);

      expect(isValid).toBe(true);
    }
  });

  test('strategy files should follow naming conventions', () => {
    const aiFiles = FileSystemUtils.getFilesInLayer('ai');

    for (const file of aiFiles) {
      const fileName = FileSystemUtils.getFileName(file);
      const isValid = ValidationUtils.validateNaming(
        fileName,
        ARCHITECTURE_CONFIG.naming.strategies
      );

      expect(isValid).toBe(true);
    }
  });
});
