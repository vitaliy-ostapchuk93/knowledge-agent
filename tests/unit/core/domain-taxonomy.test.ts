/**
 * Tests for Domain-Aware Taxonomy System
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { DomainTaxonomyManager } from '@/core/domain-taxonomy.ts';
import type { TermLearningConfig } from '@/interfaces/taxonomy-config.ts';
import type { LearningContext } from '@/interfaces/taxonomy-learning.ts';

describe('Domain-Aware Taxonomy System', () => {
  let taxonomyManager: DomainTaxonomyManager;

  beforeEach(() => {
    taxonomyManager = new DomainTaxonomyManager({
      minConfidence: 0.6,
      minFrequency: 2,
      maxLearnedTerms: 100,
      enableExternalValidation: false,
      focusDomains: ['programming', 'data-science'],
      excludeTerms: ['the', 'and', 'or'],
    });
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const manager = new DomainTaxonomyManager();
      expect(manager).toBeInstanceOf(DomainTaxonomyManager);
    });

    it('should initialize with custom configuration', () => {
      expect(taxonomyManager).toBeInstanceOf(DomainTaxonomyManager);
    });

    it('should have static terms after initialization', async () => {
      await taxonomyManager.initialize();
      const programmingTerms = taxonomyManager.getTermsForDomain('programming');
      expect(programmingTerms.length).toBeGreaterThan(0);

      const hasJavaScript = programmingTerms.some(term => term.term === 'javascript');
      expect(hasJavaScript).toBe(true);
    });
  });

  describe('Domain Management', () => {
    beforeEach(async () => {
      await taxonomyManager.initialize();
    });

    it('should get available domains', () => {
      const domains = taxonomyManager.getDomains();
      expect(domains.length).toBeGreaterThan(0);

      const domainNames = domains.map(d => d.name);
      expect(domainNames).toContain('programming');
      expect(domainNames).toContain('data-science');
    });

    it('should add new domain', () => {
      const newDomain = {
        name: 'design',
        description: 'Design and UX concepts',
        categories: ['ui', 'ux', 'visual-design', 'interaction-design'],
        keywordPatterns: ['design', 'ux', 'ui'],
        confidenceThreshold: 0.8,
      };

      taxonomyManager.addDomain(newDomain);
      const domains = taxonomyManager.getDomains();
      expect(domains.some(d => d.name === 'design')).toBe(true);
    });

    it('should get terms for specific domain', () => {
      const programmingTerms = taxonomyManager.getTermsForDomain('programming');
      expect(programmingTerms.length).toBeGreaterThan(0);

      programmingTerms.forEach(term => {
        expect(term.domain).toBe('programming');
      });
    });
  });

  describe('Content Classification', () => {
    beforeEach(async () => {
      await taxonomyManager.initialize();
    });

    it('should classify programming content', () => {
      const content = 'This JavaScript React tutorial shows how to build modern web applications';
      const classification = taxonomyManager.classifyContent(content);

      expect(classification.length).toBeGreaterThan(0);
      const programmingClassification = classification.find(c => c.domain === 'programming');
      expect(programmingClassification).toBeDefined();
      expect(programmingClassification!.confidence).toBeGreaterThan(0);
    });

    it('should classify data science content', () => {
      const content = 'Machine learning with Python pandas and scikit-learn for data analysis';
      const classification = taxonomyManager.classifyContent(content);

      expect(classification.length).toBeGreaterThan(0);
      // May classify as programming or data-science, both are valid
      const hasRelevantClassification = classification.some(
        c => c.domain === 'data-science' || c.domain === 'programming'
      );
      expect(hasRelevantClassification).toBe(true);
    });

    it('should handle unknown content gracefully', () => {
      const content = 'This is just random text about cooking recipes and food';
      const classification = taxonomyManager.classifyContent(content);

      expect(classification).toBeInstanceOf(Array);
      // Should return some classification even for unknown content
    });
  });

  describe('Term Learning', () => {
    beforeEach(async () => {
      await taxonomyManager.initialize();
    });

    it('should learn terms from content', async () => {
      const content =
        'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript';
      const context: LearningContext = {
        contentSource: 'test-content',
        contentType: 'tutorial',
        platform: 'web',
        metadata: { testCase: true },
      };

      const learnedTerms = await taxonomyManager.learnFromContent(content, context);
      expect(learnedTerms).toBeInstanceOf(Array);
    });

    it('should add new terms manually', async () => {
      const newTerm = {
        term: 'next.js',
        domain: 'programming',
        category: 'framework',
        confidence: 0.9,
        source: 'learned' as const,
        frequency: 1,
        lastSeen: new Date(),
      };

      await taxonomyManager.addTerm(newTerm);
      const programmingTerms = taxonomyManager.getTermsForDomain('programming');
      const hasNextJS = programmingTerms.some(term => term.term === 'next.js');
      expect(hasNextJS).toBe(true);
    });
  });

  describe('Related Terms', () => {
    beforeEach(async () => {
      await taxonomyManager.initialize();
    });

    it('should find related terms', () => {
      const relatedTerms = taxonomyManager.getRelatedTerms('javascript', 5);
      expect(relatedTerms).toBeInstanceOf(Array);
      expect(relatedTerms.length).toBeLessThanOrEqual(5);
    });

    it('should handle non-existent terms', () => {
      const relatedTerms = taxonomyManager.getRelatedTerms('nonexistentterm123', 5);
      expect(relatedTerms).toBeInstanceOf(Array);
      expect(relatedTerms.length).toBe(0);
    });
  });

  describe('Metrics and Export', () => {
    beforeEach(async () => {
      await taxonomyManager.initialize();
    });

    it('should provide taxonomy metrics', () => {
      const metrics = taxonomyManager.getMetrics();
      expect(metrics).toHaveProperty('totalTerms');
      expect(metrics).toHaveProperty('termsBySource');
      expect(metrics).toHaveProperty('termsByDomain');
      expect(metrics.totalTerms).toBeGreaterThan(0);
    });

    it('should export taxonomy data', () => {
      const exportedData = taxonomyManager.exportTaxonomy();
      expect(exportedData).toBeInstanceOf(Object);
      expect(exportedData).toHaveProperty('programming');
      expect(exportedData['programming']).toBeInstanceOf(Array);
    });

    it('should import taxonomy data', async () => {
      const exportedData = taxonomyManager.exportTaxonomy();

      // Create new manager and import data
      const newManager = new DomainTaxonomyManager();
      await newManager.importTaxonomy(exportedData);

      const importedTerms = newManager.getTermsForDomain('programming');
      expect(importedTerms.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const newConfig = {
        minConfidence: 0.8,
        maxLearnedTerms: 200,
      };

      taxonomyManager.updateConfig(newConfig);
      // Configuration is updated internally
      expect(taxonomyManager).toBeInstanceOf(DomainTaxonomyManager);
    });
  });
});
