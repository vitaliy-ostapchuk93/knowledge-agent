/**
 * Content Quality Assessment Interface
 * Provides comprehensive quality assessment for discovered content
 */

import { ContentItem, ContentSource } from '@/types';

/**
 * Detailed quality metrics for content assessment
 */
export interface ContentQualityMetrics {
  /** Overall quality score (0-1) */
  overallScore: number;

  /** Individual quality factors */
  factors: {
    /** Content completeness (word count, structure) */
    completeness: number;
    /** Content accuracy indicators */
    accuracy: number;
    /** Content freshness/recency */
    freshness: number;
    /** Author credibility */
    credibility: number;
    /** Content depth and detail */
    depth: number;
    /** Technical accuracy (for technical content) */
    technicalAccuracy: number;
    /** Readability and clarity */
    readability: number;
  };

  /** Quality assessment breakdown */
  breakdown: {
    /** Strengths identified in the content */
    strengths: string[];
    /** Weaknesses or concerns identified */
    weaknesses: string[];
    /** Recommendations for improvement */
    recommendations: string[];
  };
}

/**
 * Source reliability assessment
 */
export interface SourceReliabilityMetrics {
  /** Overall reliability score (0-1) */
  reliabilityScore: number;

  /** Source-specific factors */
  factors: {
    /** Domain authority/reputation */
    authority: number;
    /** Content consistency over time */
    consistency: number;
    /** Peer validation (citations, references) */
    validation: number;
    /** Update frequency and maintenance */
    maintenance: number;
    /** Community trust/engagement */
    communityTrust: number;
  };

  /** Source classification */
  classification: {
    /** Source type (official, community, personal, etc.) */
    type: 'official' | 'community' | 'academic' | 'commercial' | 'personal' | 'unknown';
    /** Confidence in classification */
    confidence: number;
    /** Reasoning for classification */
    reasoning: string[];
  };
}

/**
 * Quality assessment options
 */
export interface QualityAssessmentOptions {
  /** Domain-specific assessment (programming, data science, etc.) */
  domain?: string;
  /** Assessment depth level */
  depth?: 'basic' | 'detailed' | 'comprehensive';
  /** Include content analysis (more expensive) */
  includeContentAnalysis?: boolean;
  /** Language for assessment */
  language?: string;
  /** Custom quality criteria weights */
  customWeights?: Partial<Record<keyof ContentQualityMetrics['factors'], number>>;
}

/**
 * Content quality assessment interface
 */
export interface IContentQualityAssessor {
  /**
   * Assess the quality of a content item
   */
  assessContentQuality(
    content: ContentItem,
    options?: QualityAssessmentOptions
  ): Promise<ContentQualityMetrics>;

  /**
   * Assess source reliability
   */
  assessSourceReliability(
    source: ContentSource,
    url?: string,
    options?: QualityAssessmentOptions
  ): Promise<SourceReliabilityMetrics>;

  /**
   * Batch assess multiple content items
   */
  batchAssessQuality(
    contents: ContentItem[],
    options?: QualityAssessmentOptions
  ): Promise<ContentQualityMetrics[]>;

  /**
   * Get quality threshold recommendations for filtering
   */
  getQualityThresholds(domain?: string): {
    minimal: number;
    good: number;
    excellent: number;
  };

  /**
   * Compare content quality between items
   */
  compareQuality(
    content1: ContentItem,
    content2: ContentItem,
    options?: QualityAssessmentOptions
  ): Promise<{
    winner: 'content1' | 'content2' | 'tie';
    confidence: number;
    reasoning: string[];
  }>;
}
