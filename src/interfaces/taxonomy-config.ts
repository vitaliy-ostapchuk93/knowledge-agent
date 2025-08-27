/**
 * Taxonomy Configuration and Metrics Interfaces
 * Configuration settings and metrics for the taxonomy system
 */

export interface TermLearningConfig {
  /** Minimum confidence to accept a learned term */
  minConfidence: number;

  /** Minimum frequency before considering a term */
  minFrequency: number;

  /** Maximum number of learned terms to store */
  maxLearnedTerms: number;

  /** Whether to enable external validation */
  enableExternalValidation: boolean;

  /** Domains to focus learning on */
  focusDomains?: string[];

  /** Terms to exclude from learning */
  excludeTerms?: string[];
}

export interface TaxonomyMetrics {
  /** Total number of terms */
  totalTerms: number;

  /** Terms by source */
  termsBySource: Record<string, number>;

  /** Terms by domain */
  termsByDomain: Record<string, number>;

  /** Learning accuracy over time */
  learningAccuracy: number;

  /** External validation success rate */
  validationSuccessRate: number;

  /** Most frequently encountered terms */
  topTerms: Array<{ term: string; frequency: number }>;
}
