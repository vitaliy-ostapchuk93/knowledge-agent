/**
 * Domain-Aware Taxonomy System Implementation
 * Combines static base terms with dynamic learning and external validation
 */

import { logger } from '@/utils/logger.ts';
import type { 
  ITaxonomyManager,
} from '@/interfaces/taxonomy-manager.ts';
import type {
  TaxonomyTerm,
  TaxonomyDomain,
} from '@/types/taxonomy.ts';
import type {
  LearningContext,
  ExternalValidator,
  ValidationResult,
} from '@/interfaces/taxonomy-learning.ts';
import type {
  TermLearningConfig,
  TaxonomyMetrics,
} from '@/interfaces/taxonomy-config.ts';

/**
 * Domain-Aware Taxonomy Manager
 * Implements static base + dynamic learning + external validation
 */
export class DomainTaxonomyManager implements ITaxonomyManager {
  private staticTerms: Map<string, TaxonomyTerm> = new Map();
  private learnedTerms: Map<string, TaxonomyTerm> = new Map();
  private domains: Map<string, TaxonomyDomain> = new Map();
  private validators: ExternalValidator[] = [];
  private config: TermLearningConfig;
  private metrics: TaxonomyMetrics;

  constructor(config?: TermLearningConfig) {
    this.config = {
      minConfidence: 0.7,
      minFrequency: 3,
      maxLearnedTerms: 1000,
      enableExternalValidation: true,
      focusDomains: ['programming', 'data-science', 'design', 'business'],
      excludeTerms: ['the', 'and', 'or', 'but', 'is', 'are', 'was', 'were'],
      ...config,
    };

    this.metrics = {
      totalTerms: 0,
      termsBySource: {},
      termsByDomain: {},
      learningAccuracy: 0,
      validationSuccessRate: 0,
      topTerms: [],
    };
  }

  /**
   * Initialize the taxonomy system
   */
  async initialize(config?: TermLearningConfig): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    logger.info('🔧 Initializing Domain-Aware Taxonomy System...');

    this.initializeDomains();
    this.initializeStaticTerms();
    this.updateMetrics();

    logger.info(
      `✅ Taxonomy initialized with ${this.staticTerms.size} static terms across ${this.domains.size} domains`
    );
  }

  /**
   * Add or update a term
   */
  async addTerm(term: TaxonomyTerm, context?: LearningContext): Promise<void> {
    if (term.source === 'static') {
      this.staticTerms.set(term.term, term);
    } else {
      this.learnedTerms.set(term.term, term);
    }

    if (context && this.config.enableExternalValidation) {
      const validation = await this.validateTerm(term.term, term.domain);
      if (validation.isValid) {
        term.confidence = Math.min(1.0, term.confidence + 0.1);
        term.source = 'validated';
      }
    }

    this.updateMetrics();
    logger.debug(`Added term: ${term.term} (${term.source})`);
  }

  /**
   * Learn terms from content
   */
  async learnFromContent(content: string, context: LearningContext): Promise<TaxonomyTerm[]> {
    const candidateTerms = this.extractCandidateTerms(content);
    const learnedTerms: TaxonomyTerm[] = [];

    for (const candidate of candidateTerms) {
      if (this.isExcludedTerm(candidate) || this.isKnownTerm(candidate)) {
        continue;
      }

      const analysis = await this.analyzeTermCandidate(candidate, content, context);

      if (analysis.confidence >= this.config.minConfidence) {
        const newTerm: TaxonomyTerm = {
          term: candidate,
          domain: analysis.domain,
          category: analysis.category,
          confidence: analysis.confidence,
          source: 'learned',
          frequency: 1,
          lastSeen: new Date(),
          relatedTerms: analysis.relatedTerms,
          contexts: [context.contentType],
          platformUsage: { [context.platform]: 1 },
        };

        await this.addTerm(newTerm, context);
        learnedTerms.push(newTerm);
      }
    }

    return learnedTerms;
  }

  /**
   * Validate a term using external sources
   */
  async validateTerm(term: string, domain: string): Promise<ValidationResult> {
    if (!this.config.enableExternalValidation || this.validators.length === 0) {
      return { isValid: false, confidence: 0, source: 'none' };
    }

    for (const validator of this.validators) {
      try {
        const result = await validator.validate(term, domain);
        if (result.isValid) {
          this.metrics.validationSuccessRate = (this.metrics.validationSuccessRate + 1) / 2; // Simple moving average
          return result;
        }
      } catch (error) {
        logger.warn(`Validation failed for ${term} with ${validator.name}:`, error);
      }
    }

    return { isValid: false, confidence: 0, source: 'failed' };
  }

  /**
   * Get terms for a specific domain
   */
  getTermsForDomain(domain: string): TaxonomyTerm[] {
    const terms: TaxonomyTerm[] = [];

    for (const term of this.staticTerms.values()) {
      if (term.domain === domain) {
        terms.push(term);
      }
    }

    for (const term of this.learnedTerms.values()) {
      if (term.domain === domain) {
        terms.push(term);
      }
    }

    return terms.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get related terms
   */
  getRelatedTerms(term: string, limit: number = 5): string[] {
    const termData = this.staticTerms.get(term) || this.learnedTerms.get(term);
    if (!termData?.relatedTerms) {
      return [];
    }

    return termData.relatedTerms.slice(0, limit);
  }

  /**
   * Classify content into domains
   */
  classifyContent(content: string): Array<{ domain: string; confidence: number }> {
    const domainScores = new Map<string, number>();
    const tokens = content.toLowerCase().split(/\s+/);

    // Score each domain based on term matches
    for (const token of tokens) {
      const staticTerm = this.staticTerms.get(token);
      const learnedTerm = this.learnedTerms.get(token);
      const term = staticTerm || learnedTerm;

      if (term) {
        const currentScore = domainScores.get(term.domain) || 0;
        domainScores.set(term.domain, currentScore + term.confidence);
      }
    }

    // Normalize scores and sort
    const totalScore = Array.from(domainScores.values()).reduce((a, b) => a + b, 0);
    const results = Array.from(domainScores.entries())
      .map(([domain, score]) => ({
        domain,
        confidence: totalScore > 0 ? score / totalScore : 0,
      }))
      .sort((a, b) => b.confidence - a.confidence);

    return results;
  }

  /**
   * Get taxonomy metrics
   */
  getMetrics(): TaxonomyMetrics {
    return { ...this.metrics };
  }

  /**
   * Export taxonomy data
   */
  exportTaxonomy(): Record<string, TaxonomyTerm[]> {
    const exportData: Record<string, TaxonomyTerm[]> = {};

    for (const domain of this.domains.keys()) {
      exportData[domain] = this.getTermsForDomain(domain);
    }

    return exportData;
  }

  /**
   * Import taxonomy data
   */
  async importTaxonomy(data: Record<string, TaxonomyTerm[]>): Promise<void> {
    for (const [/* domain */, terms] of Object.entries(data)) {
      for (const term of terms) {
        await this.addTerm(term);
      }
    }

    this.updateMetrics();
    logger.info(`Imported taxonomy data for ${Object.keys(data).length} domains`);
  }

  /**
   * Register external validator
   */
  registerValidator(validator: ExternalValidator): void {
    this.validators.push(validator);
    logger.info(`Registered external validator: ${validator.name}`);
  }

  /**
   * Update learning configuration
   */
  updateConfig(config: Partial<TermLearningConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Updated taxonomy configuration');
  }

  /**
   * Get available domains
   */
  getDomains(): TaxonomyDomain[] {
    return Array.from(this.domains.values());
  }

  /**
   * Add new domain
   */
  addDomain(domain: TaxonomyDomain): void {
    this.domains.set(domain.name, domain);
    logger.info(`Added domain: ${domain.name}`);
  }

  // Private helper methods

  private initializeStaticTerms(): void {
    // Programming Languages
    const languages = [
      'javascript',
      'typescript',
      'python',
      'java',
      'csharp',
      'cpp',
      'rust',
      'go',
      'php',
      'ruby',
      'swift',
      'kotlin',
      'dart',
      'scala',
      'r',
      'matlab',
    ];

    languages.forEach(term => {
      this.staticTerms.set(term, {
        term,
        domain: 'programming',
        category: 'language',
        confidence: 1.0,
        source: 'static',
        frequency: 0,
        lastSeen: new Date(),
      });
    });

    // Frameworks
    const frameworks = [
      'react',
      'vue',
      'angular',
      'svelte',
      'node',
      'express',
      'fastapi',
      'django',
      'flask',
      'spring',
      'laravel',
      'rails',
      'next',
      'nuxt',
    ];

    frameworks.forEach(term => {
      this.staticTerms.set(term, {
        term,
        domain: 'programming',
        category: 'framework',
        confidence: 1.0,
        source: 'static',
        frequency: 0,
        lastSeen: new Date(),
      });
    });

    // Core concepts
    const concepts = [
      'api',
      'database',
      'algorithm',
      'authentication',
      'authorization',
      'microservices',
      'containerization',
      'ci-cd',
      'testing',
      'debugging',
    ];

    concepts.forEach(term => {
      this.staticTerms.set(term, {
        term,
        domain: 'software-engineering',
        category: 'concept',
        confidence: 1.0,
        source: 'static',
        frequency: 0,
        lastSeen: new Date(),
      });
    });
  }

  private initializeDomains(): void {
    const domains: TaxonomyDomain[] = [
      {
        name: 'programming',
        description: 'Programming languages, frameworks, and tools',
        categories: ['language', 'framework', 'library', 'tool'],
        keywordPatterns: ['code', 'programming', 'development', 'syntax'],
        confidenceThreshold: 0.7,
      },
      {
        name: 'software-engineering',
        description: 'Software engineering practices and methodologies',
        categories: ['concept', 'methodology', 'practice', 'tool'],
        keywordPatterns: ['software', 'engineering', 'architecture', 'design'],
        confidenceThreshold: 0.6,
      },
      {
        name: 'data-science',
        description: 'Data analysis, machine learning, and statistics',
        categories: ['analysis', 'modeling', 'visualization', 'statistics'],
        keywordPatterns: ['data', 'analysis', 'machine learning', 'statistics'],
        confidenceThreshold: 0.7,
      },
      {
        name: 'web-development',
        description: 'Web development technologies and practices',
        categories: ['frontend', 'backend', 'fullstack', 'protocol'],
        parentDomain: 'programming',
        keywordPatterns: ['web', 'frontend', 'backend', 'browser'],
        confidenceThreshold: 0.6,
      },
    ];

    domains.forEach(domain => {
      this.domains.set(domain.name, domain);
    });
  }

  private updateMetrics(): void {
    this.metrics.totalTerms = this.staticTerms.size + this.learnedTerms.size;

    // Update terms by source
    this.metrics.termsBySource = {
      static: this.staticTerms.size,
      learned: this.learnedTerms.size,
      external: 0,
      validated: 0,
    };

    // Update terms by domain
    this.metrics.termsByDomain = {};
    for (const term of [...this.staticTerms.values(), ...this.learnedTerms.values()]) {
      this.metrics.termsByDomain[term.domain] = (this.metrics.termsByDomain[term.domain] || 0) + 1;
    }

    // Update top terms
    const allTerms = [...this.staticTerms.values(), ...this.learnedTerms.values()];
    this.metrics.topTerms = allTerms
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)
      .map(term => ({ term: term.term, frequency: term.frequency }));
  }

  private extractCandidateTerms(content: string): string[] {
    const tokens = content
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter((token: string) => token.length >= 3 && token.length <= 25)
      .filter((token: string) => !this.isStopWord(token));

    return [...new Set(tokens)];
  }

  private async analyzeTermCandidate(
    term: string,
    content: string,
    context: LearningContext
  ): Promise<{ confidence: number; domain: string; category: string; relatedTerms: string[] }> {
    let confidence = 0.3; // Base confidence
    let domain = 'general';
    let category = 'unknown';
    const relatedTerms: string[] = [];

    // Context-based scoring
    if (context.contentType === 'documentation') confidence += 0.2;
    if (context.contentType === 'code') confidence += 0.3;
    if (context.platform === 'github') confidence += 0.1;

    // Pattern-based analysis
    if (term.match(/^[a-z]+js$/)) {
      // ends with 'js'
      confidence += 0.3;
      domain = 'programming';
      category = 'framework';
    }

    if (term.includes('api') || term.includes('sdk')) {
      confidence += 0.2;
      domain = 'programming';
      category = 'tool';
    }

    return { confidence, domain, category, relatedTerms };
  }

  private isExcludedTerm(term: string): boolean {
    return (this.config.excludeTerms || []).includes(term.toLowerCase());
  }

  private isKnownTerm(term: string): boolean {
    return this.staticTerms.has(term) || this.learnedTerms.has(term);
  }

  private isStopWord(token: string): boolean {
    const stopWords = new Set([
      'the',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'up',
      'about',
      'into',
      'through',
      'during',
      'before',
      'after',
      'above',
      'below',
      'between',
      'among',
      'this',
      'that',
      'these',
      'those',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
    ]);

    return stopWords.has(token.toLowerCase());
  }
}

/**
 * Create default taxonomy instance
 */
export function createDefaultTaxonomy(config?: TermLearningConfig): DomainTaxonomyManager {
  return new DomainTaxonomyManager(config);
}
