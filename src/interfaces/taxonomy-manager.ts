/**
 * Main Taxonomy Manager Interface
 * Primary interface for the domain-aware taxonomy system
 */

import type { TaxonomyTerm, TaxonomyDomain } from '@/types/taxonomy.ts';
import type { LearningContext, ExternalValidator, ValidationResult } from '@/interfaces/taxonomy-learning.ts';
import type { TermLearningConfig, TaxonomyMetrics } from '@/interfaces/taxonomy-config.ts';

export interface ITaxonomyManager {
  /**
   * Initialize the taxonomy system
   */
  initialize(config?: TermLearningConfig): Promise<void>;

  /**
   * Add or update a term
   */
  addTerm(term: TaxonomyTerm, context?: LearningContext): Promise<void>;

  /**
   * Learn terms from content
   */
  learnFromContent(content: string, context: LearningContext): Promise<TaxonomyTerm[]>;

  /**
   * Validate a term using external sources
   */
  validateTerm(term: string, domain: string): Promise<ValidationResult>;

  /**
   * Get terms for a specific domain
   */
  getTermsForDomain(domain: string): TaxonomyTerm[];

  /**
   * Get related terms
   */
  getRelatedTerms(term: string, limit?: number): string[];

  /**
   * Classify content into domains
   */
  classifyContent(content: string): Array<{ domain: string; confidence: number }>;

  /**
   * Get taxonomy metrics
   */
  getMetrics(): TaxonomyMetrics;

  /**
   * Export taxonomy data
   */
  exportTaxonomy(): Record<string, TaxonomyTerm[]>;

  /**
   * Import taxonomy data
   */
  importTaxonomy(data: Record<string, TaxonomyTerm[]>): Promise<void>;

  /**
   * Register external validator
   */
  registerValidator(validator: ExternalValidator): void;

  /**
   * Update learning configuration
   */
  updateConfig(config: Partial<TermLearningConfig>): void;

  /**
   * Get available domains
   */
  getDomains(): TaxonomyDomain[];

  /**
   * Add new domain
   */
  addDomain(domain: TaxonomyDomain): void;
}
