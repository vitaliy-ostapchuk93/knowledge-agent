/**
 * Core Taxonomy Types
 * Fundamental types for the domain-aware taxonomy system
 */

/** Difficulty level assessment for terms */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/** Source of a taxonomy term */
export type TermSource = 'static' | 'learned' | 'external' | 'validated';

/** Content types for learning context */
export type TaxonomyContentType = 'article' | 'documentation' | 'code' | 'discussion' | 'tutorial' | 'reference';

/** Platform types for content sources */
export type TaxonomyPlatformType = 'reddit' | 'youtube' | 'github' | 'web' | 'stackoverflow' | 'medium';

/** User feedback types */
export type UserFeedback = 'positive' | 'negative' | 'neutral';

export interface TaxonomyTerm {
  /** The actual term/concept */
  term: string;

  /** Domain this term belongs to (programming, data-science, design, etc.) */
  domain: string;

  /** Category within the domain (language, framework, concept, etc.) */
  category: string;

  /** Confidence score (0-1) in term classification */
  confidence: number;

  /** Source of the term */
  source: TermSource;

  /** How often this term has been encountered */
  frequency: number;

  /** When this term was last encountered */
  lastSeen: Date;

  /** Related terms that often appear together */
  relatedTerms?: string[];

  /** Alternative names/spellings for this term */
  aliases?: string[];

  /** Context where this term is commonly used */
  contexts?: string[];

  /** Difficulty level assessment */
  difficulty?: DifficultyLevel;

  /** Platform-specific usage patterns */
  platformUsage?: Record<string, number>;
}

export interface TaxonomyDomain {
  /** Domain identifier */
  name: string;

  /** Human-readable description */
  description: string;

  /** Categories within this domain */
  categories: string[];

  /** Parent domain if this is a subdomain */
  parentDomain?: string;

  /** Child domains */
  subDomains?: string[];

  /** Domain-specific keywords that help identify content */
  keywordPatterns?: string[];

  /** Confidence threshold for auto-classification in this domain */
  confidenceThreshold?: number;
}
