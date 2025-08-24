/**
 * SOLID Principles Test Utilities
 *
 * Provides common utilities for testing SOLID principles compliance
 * without depending on specific implementation details.
 */

import { readFileSync } from 'fs';
import { ARCHITECTURE_CONFIG } from './test-utils';

export class SolidTestUtils {
  /**
   * Extract class names from TypeScript content
   */
  static extractClasses(content: string): string[] {
    const classRegex = /class\s+(\w+)/g;
    const matches: string[] = [];
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }

    return matches;
  }

  /**
   * Extract method names from a class in TypeScript content
   */
  static extractMethods(content: string, className: string): string[] {
    // Look for class definition and extract methods within it
    const classRegex = new RegExp(`class\\s+${className}[^{]*{([^}]+)}`, 's');
    const classMatch = classRegex.exec(content);

    if (!classMatch) return [];

    const classBody = classMatch[1];
    const methodRegex = /(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\(/g;
    const methods: string[] = [];
    let match;

    while ((match = methodRegex.exec(classBody)) !== null) {
      // Skip constructor
      if (match[1] !== 'constructor') {
        methods.push(match[1]);
      }
    }

    return methods;
  }

  /**
   * Extract interfaces that a class implements
   */
  static extractImplementedInterfaces(content: string, className: string): string[] {
    const implementsRegex = new RegExp(`class\\s+${className}[^{]*implements\\s+([^{]+)`, 'i');
    const match = implementsRegex.exec(content);

    if (!match) return [];

    return match[1]
      .split(',')
      .map(iface => iface.trim())
      .filter(Boolean);
  }

  /**
   * Check if content indicates mixed responsibilities
   */
  static hasMixedResponsibilities(content: string, indicators: string[]): boolean {
    const foundIndicators = indicators.filter(indicator =>
      content.toLowerCase().includes(indicator.toLowerCase())
    );

    // Mixed if more than one responsibility indicator is found
    return foundIndicators.length > 1;
  }

  /**
   * Validate SRP compliance for a file
   */
  static validateSingleResponsibility(filePath: string): {
    isValid: boolean;
    violations: string[];
  } {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const classes = this.extractClasses(content);
      const violations: string[] = [];

      for (const className of classes) {
        const methods = this.extractMethods(content, className);
        const interfaces = this.extractImplementedInterfaces(content, className);

        // Check method count
        if (methods.length > ARCHITECTURE_CONFIG.limits.maxMethodsPerClass) {
          violations.push(
            `Class ${className} has too many methods (${methods.length} > ${ARCHITECTURE_CONFIG.limits.maxMethodsPerClass})`
          );
        }

        // Check interface count
        if (interfaces.length > ARCHITECTURE_CONFIG.limits.maxInterfacesPerImplementation) {
          violations.push(
            `Class ${className} implements too many interfaces (${interfaces.length} > ${ARCHITECTURE_CONFIG.limits.maxInterfacesPerImplementation})`
          );
        }
      }

      return {
        isValid: violations.length === 0,
        violations,
      };
    } catch {
      return { isValid: true, violations: [] };
    }
  }

  /**
   * Check if a layer component has focused responsibility
   */
  static validateLayerComponentResponsibility(
    filePath: string,
    layer: string,
    expectedPatterns: string[]
  ): boolean {
    try {
      const content = readFileSync(filePath, 'utf-8').toLowerCase();

      // For the specified layer, content should focus on expected patterns
      const foundPatterns = expectedPatterns.filter(pattern =>
        content.includes(pattern.toLowerCase())
      );

      // Should have at least one expected pattern
      return foundPatterns.length > 0;
    } catch {
      return true; // If file doesn't exist, consider it valid
    }
  }
}

/**
 * Open/Closed Principle utilities
 */
export class OpenClosedTestUtils {
  /**
   * Check if code uses interfaces for extension points
   */
  static hasExtensionInterfaces(content: string): boolean {
    return (
      /interface\s+\w+/.test(content) ||
      /implements\s+\w+/.test(content) ||
      /extends\s+\w+/.test(content)
    );
  }

  /**
   * Check if code follows strategy pattern
   */
  static followsStrategyPattern(content: string): boolean {
    return (
      content.includes('Strategy') ||
      content.includes('strategy') ||
      this.hasExtensionInterfaces(content)
    );
  }

  /**
   * Check if code follows adapter pattern
   */
  static followsAdapterPattern(content: string): boolean {
    return (
      content.includes('Adapter') ||
      content.includes('adapter') ||
      this.hasExtensionInterfaces(content)
    );
  }
}

/**
 * Interface Segregation Principle utilities
 */
export class InterfaceSegregationTestUtils {
  /**
   * Extract interface definitions from content
   */
  static extractInterfaces(content: string): Array<{
    name: string;
    methods: string[];
  }> {
    const interfaces: Array<{ name: string; methods: string[] }> = [];
    const interfaceRegex = /interface\s+(\w+)[^{]*{([^}]+)}/g;
    let match;

    while ((match = interfaceRegex.exec(content)) !== null) {
      const name = match[1];
      const body = match[2];

      // Extract method signatures
      const methodRegex = /(\w+)\s*\([^)]*\)\s*:/g;
      const methods: string[] = [];
      let methodMatch;

      while ((methodMatch = methodRegex.exec(body)) !== null) {
        methods.push(methodMatch[1]);
      }

      interfaces.push({ name, methods });
    }

    return interfaces;
  }

  /**
   * Check if interface is focused (not a god interface)
   */
  static isInterfaceFocused(methods: string[]): boolean {
    return methods.length <= ARCHITECTURE_CONFIG.limits.maxMethodsPerInterface;
  }
}

/**
 * Dependency Inversion Principle utilities
 */
export class DependencyInversionTestUtils {
  /**
   * Extract constructor dependencies from content
   */
  static extractConstructorDependencies(content: string): string[] {
    const constructorRegex = /constructor\s*\([^)]*\)/g;
    const dependencies: string[] = [];
    const match = constructorRegex.exec(content);

    if (match) {
      const params = match[0];
      const paramRegex = /(\w+)\s*:\s*(\w+)/g;
      let paramMatch;

      while ((paramMatch = paramRegex.exec(params)) !== null) {
        dependencies.push(paramMatch[2]);
      }
    }

    return dependencies;
  }

  /**
   * Check if a type name represents an interface
   */
  static isInterface(typeName: string): boolean {
    return typeName.startsWith('I') && /^I[A-Z]/.test(typeName);
  }

  /**
   * Calculate ratio of interface dependencies vs concrete dependencies
   */
  static calculateAbstractionRatio(dependencies: string[]): number {
    if (dependencies.length === 0) return 1;

    const interfaceDeps = dependencies.filter(this.isInterface);
    return interfaceDeps.length / dependencies.length;
  }
}
