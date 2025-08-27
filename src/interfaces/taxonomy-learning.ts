/**
 * Taxonomy Learning and Validation Interfaces
 * Interfaces for learning terms from content and external validation
 */

import type { TaxonomyContentType, TaxonomyPlatformType, UserFeedback } from '@/types/taxonomy.ts';

export interface LearningContext {
  /** Where the content came from */
  contentSource: string;

  /** Type of content */
  contentType: TaxonomyContentType;

  /** Platform where content was found */
  platform: TaxonomyPlatformType;

  /** User feedback on term relevance */
  userFeedback?: UserFeedback;

  /** Language of the content */
  language?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface ExternalValidator {
  /** Validator name/identifier */
  name: string;

  /** API endpoint or service URL */
  endpoint?: string;

  /** Validate if a term belongs to a domain */
  validate(term: string, domain: string): Promise<ValidationResult>;

  /** Check if validator is available */
  isAvailable(): Promise<boolean>;

  /** Get validator capabilities */
  getCapabilities(): string[];
}

export interface ValidationResult {
  /** Whether the term is valid for the domain */
  isValid: boolean;

  /** Confidence in the validation (0-1) */
  confidence: number;

  /** Source of validation */
  source: string;

  /** Additional metadata from validation */
  metadata?: Record<string, unknown>;

  /** Suggested corrections if invalid */
  suggestions?: string[];

  /** Related terms found during validation */
  relatedTerms?: string[];
}
