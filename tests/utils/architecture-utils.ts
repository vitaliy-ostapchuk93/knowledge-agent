/**
 * Architecture-specific test utilities
 * Contains utilities specific to architecture testing and validation
 */

// Configuration based on building blocks documentation
export const ARCHITECTURE_CONFIG = {
  layers: {
    core: {
      description: 'Core business logic',
      allowedDependencies: ['interfaces', 'types']
    },
    adapters: {
      description: 'External system adapters',
      allowedDependencies: ['interfaces', 'types', 'core']
    },
    ai: {
      description: 'AI strategy implementations',
      allowedDependencies: ['interfaces', 'types']
    },
    discovery: {
      description: 'Content discovery services',
      allowedDependencies: ['interfaces', 'types', 'adapters']
    },
    cache: {
      description: 'Caching layer',
      allowedDependencies: ['interfaces', 'types']
    },
    events: {
      description: 'Event handling',
      allowedDependencies: ['interfaces', 'types']
    }
  },
  limits: {
    maxMethodsPerClass: 10,
    maxInterfacesPerImplementation: 3,
    maxMethodsPerInterface: 5
  },
  forbiddenPatterns: [
    '../../../',  // Deep relative imports
    'dist/',      // Compiled output imports
    'node_modules' // Direct node_modules imports
  ]
};

/**
 * Architecture validation utilities
 */
export class ValidationUtils {
  /**
   * Validate that a layer only depends on allowed layers
   */
  static validateLayerDependencies(layer: string, imports: string[]): string[] {
    const layerConfig = ARCHITECTURE_CONFIG.layers[layer as keyof typeof ARCHITECTURE_CONFIG.layers];
    if (!layerConfig) {
      return [`Unknown layer: ${layer}`];
    }

    const violations: string[] = [];
    const allowedDependencies = layerConfig.allowedDependencies;

    for (const imp of imports) {
      // Check if import is from another layer
      for (const [layerName] of Object.entries(ARCHITECTURE_CONFIG.layers)) {
        if (imp.includes(`/${layerName}/`) && !allowedDependencies.includes(layerName)) {
          violations.push(`${layer} should not depend on ${layerName} (import: ${imp})`);
        }
      }
    }

    return violations;
  }

  /**
   * Check for forbidden patterns in code
   */
  static checkForbiddenPatterns(content: string, filePath: string): string[] {
    const violations: string[] = [];

    for (const pattern of ARCHITECTURE_CONFIG.forbiddenPatterns) {
      if (content.includes(pattern)) {
        violations.push(`Forbidden pattern '${pattern}' found in ${filePath}`);
      }
    }

    return violations;
  }

  /**
   * Extract imports from a TypeScript file
   */
  static extractImports(content: string): string[] {
    const importRegex = /import\s+.*?from\s+['"`]([^'"`]+)['"`]/g;
    const imports: string[] = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  /**
   * Check for circular dependencies
   */
  static detectCircularDependencies(_layer: string, imports: string[]): string[] {
    // Basic implementation - check for relative imports that go up multiple levels
    return imports.filter(imp => imp.startsWith('../../../'));
  }
}
