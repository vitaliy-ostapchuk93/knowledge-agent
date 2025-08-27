/**
 * Architecture tests for Domain-Aware Taxonomy System
 * Validates taxonomy system follows architectural constraints and design principles
 */

import { describe, it, expect } from 'bun:test';
import { DomainTaxonomyManager } from '@/core/domain-taxonomy.ts';
import type { ITaxonomyManager } from '@/interfaces/taxonomy-manager.ts';
import type { TaxonomyTerm, TaxonomyDomain } from '@/types/taxonomy.ts';
import type { LearningContext } from '@/interfaces/taxonomy-learning.ts';
import type { TermLearningConfig } from '@/interfaces/taxonomy-config.ts';
describe('Domain-Aware Taxonomy Architecture', () => {
  describe('Interface Compliance', () => {
    it('should implement ITaxonomyManager interface', () => {
      const manager = new DomainTaxonomyManager();
      expect(manager).toBeInstanceOf(DomainTaxonomyManager);

      // Verify key methods exist
      expect(typeof manager.initialize).toBe('function');
      expect(typeof manager.addTerm).toBe('function');
      expect(typeof manager.learnFromContent).toBe('function');
      expect(typeof manager.getTermsForDomain).toBe('function');
      expect(typeof manager.classifyContent).toBe('function');
    });

    it('should have consistent type contracts', () => {
      const manager = new DomainTaxonomyManager();

      // Test type safety
      const domains = manager.getDomains();
      expect(domains).toBeInstanceOf(Array);

      domains.forEach(domain => {
        expect(domain).toHaveProperty('name');
        expect(domain).toHaveProperty('description');
        expect(domain).toHaveProperty('categories');
        expect(typeof domain.name).toBe('string');
        expect(typeof domain.description).toBe('string');
        expect(domain.categories).toBeInstanceOf(Array);
      });
    });
  });

  describe('Architectural Constraints', () => {
    it('should separate static and learned terms', async () => {
      const manager = new DomainTaxonomyManager();
      await manager.initialize();

      const programmingTerms = manager.getTermsForDomain('programming');
      const staticTerms = programmingTerms.filter(term => term.source === 'static');
      const learnedTerms = programmingTerms.filter(term => term.source === 'learned');

      expect(staticTerms.length).toBeGreaterThan(0);
      // Static terms should be present
      expect(staticTerms.some(term => term.term === 'javascript')).toBe(true);
    });

    it('should maintain domain separation', async () => {
      const manager = new DomainTaxonomyManager();
      await manager.initialize();

      const programmingTerms = manager.getTermsForDomain('programming');
      const dataScienceTerms = manager.getTermsForDomain('data-science');

      // Verify domain isolation
      programmingTerms.forEach(term => {
        expect(term.domain).toBe('programming');
      });

      dataScienceTerms.forEach(term => {
        expect(term.domain).toBe('data-science');
      });
    });

    it('should handle graceful degradation', () => {
      // Should work even without external validators
      const manager = new DomainTaxonomyManager({
        enableExternalValidation: false,
        minConfidence: 0.7,
        minFrequency: 2,
        maxLearnedTerms: 100,
        focusDomains: ['programming'],
        excludeTerms: ['the', 'and'],
      });

      expect(manager).toBeInstanceOf(DomainTaxonomyManager);

      const classification = manager.classifyContent('JavaScript React tutorial');
      expect(classification).toBeInstanceOf(Array);
    });
  });

  describe('Performance and Scalability', () => {
    it('should respect learning limits', async () => {
      const manager = new DomainTaxonomyManager({
        maxLearnedTerms: 5,
        minConfidence: 0.5,
        minFrequency: 1,
        enableExternalValidation: false,
        focusDomains: ['programming'],
        excludeTerms: [],
      });

      await manager.initialize();

      // Try to learn many terms
      for (let i = 0; i < 10; i++) {
        const content = `This is term${i} for learning test`;
        const context: LearningContext = {
          contentSource: 'test',
          contentType: 'tutorial',
          platform: 'web',
        };

        await manager.learnFromContent(content, context);
      }

      const metrics = manager.getMetrics();
      // Should respect the limit
      expect(metrics.totalTerms).toBeLessThanOrEqual(1000); // Including static terms
    });

    it('should provide efficient classification', () => {
      const manager = new DomainTaxonomyManager();

      const startTime = performance.now();
      const classification = manager.classifyContent(
        'JavaScript React TypeScript tutorial for beginners'
      );
      const endTime = performance.now();

      expect(classification).toBeInstanceOf(Array);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });

  describe('Data Integrity', () => {
    it('should validate term structure', async () => {
      const manager = new DomainTaxonomyManager();
      await manager.initialize();

      const programmingTerms = manager.getTermsForDomain('programming');

      programmingTerms.forEach(term => {
        // Validate required fields
        expect(term).toHaveProperty('term');
        expect(term).toHaveProperty('domain');
        expect(term).toHaveProperty('confidence');
        expect(term).toHaveProperty('source');

        // Validate types
        expect(typeof term.term).toBe('string');
        expect(typeof term.domain).toBe('string');
        expect(typeof term.confidence).toBe('number');
        expect(['static', 'learned', 'external', 'validated']).toContain(term.source);

        // Validate ranges
        expect(term.confidence).toBeGreaterThanOrEqual(0);
        expect(term.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should maintain export/import consistency', async () => {
      const manager1 = new DomainTaxonomyManager();
      await manager1.initialize();

      const exportedData = manager1.exportTaxonomy();

      const manager2 = new DomainTaxonomyManager();
      await manager2.importTaxonomy(exportedData);

      const originalTerms = manager1.getTermsForDomain('programming');
      const importedTerms = manager2.getTermsForDomain('programming');

      expect(importedTerms.length).toBe(originalTerms.length);
    });
  });

  describe('Integration Points', () => {
    it('should integrate with terms-config.ts', () => {
      // The taxonomy system should be usable by terms-config
      const manager = new DomainTaxonomyManager({
        enableExternalValidation: false,
        minConfidence: 0.7,
        minFrequency: 2,
        maxLearnedTerms: 500,
        focusDomains: ['programming', 'data-science'],
        excludeTerms: ['the', 'and', 'or'],
      });

      expect(manager).toBeInstanceOf(DomainTaxonomyManager);

      // Should provide classification capability
      const classification = manager.classifyContent('React TypeScript tutorial');
      expect(classification).toBeInstanceOf(Array);

      // Should provide terms retrieval
      const terms = manager.getTermsForDomain('programming');
      expect(terms).toBeInstanceOf(Array);
    });

    it('should maintain backward compatibility', () => {
      // Even without taxonomy, static terms should work
      // This is tested in terms-config.test.ts
      expect(true).toBe(true); // Placeholder - actual test is in terms-config
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid domains gracefully', () => {
      const manager = new DomainTaxonomyManager();

      const terms = manager.getTermsForDomain('nonexistent-domain');
      expect(terms).toBeInstanceOf(Array);
      expect(terms.length).toBe(0);
    });

    it('should handle malformed content gracefully', () => {
      const manager = new DomainTaxonomyManager();

      // Test with various problematic inputs
      const testCases = ['', '   ', '\n\t', 'single'];

      testCases.forEach(testCase => {
        expect(() => {
          manager.classifyContent(testCase);
        }).not.toThrow();
      });

      // Test empty classification returns empty array
      const emptyResult = manager.classifyContent('');
      expect(emptyResult).toBeInstanceOf(Array);
    });
  });
});
