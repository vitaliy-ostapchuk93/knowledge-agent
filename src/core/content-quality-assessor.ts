/**
 * Content Quality Assessor Implementation
 * Provides comprehensive quality assessment for discovered content
 */

import { ContentItem, ContentSource } from '@/types';
import {
  IContentQualityAssessor,
  ContentQualityMetrics,
  SourceReliabilityMetrics,
  QualityAssessmentOptions,
} from '@/interfaces/content-quality-assessor.ts';
import { logger } from '@/utils/logger.ts';
import { WordTokenizer } from 'natural';

/**
 * Content quality assessor with comprehensive analysis
 */
export class ContentQualityAssessor implements IContentQualityAssessor {
  private tokenizer: WordTokenizer;
  private sourceReliabilityCache: Map<string, SourceReliabilityMetrics>;

  // Domain-specific quality weights
  private domainWeights: Record<
    string,
    Partial<Record<keyof ContentQualityMetrics['factors'], number>>
  > = {
    programming: {
      technicalAccuracy: 0.25,
      depth: 0.2,
      completeness: 0.2,
      freshness: 0.15,
      accuracy: 0.1,
      credibility: 0.05,
      readability: 0.05,
    },
    datascience: {
      technicalAccuracy: 0.3,
      accuracy: 0.2,
      depth: 0.15,
      completeness: 0.15,
      credibility: 0.1,
      freshness: 0.05,
      readability: 0.05,
    },
    general: {
      completeness: 0.2,
      accuracy: 0.2,
      readability: 0.15,
      credibility: 0.15,
      freshness: 0.1,
      depth: 0.1,
      technicalAccuracy: 0.1,
    },
  };

  constructor() {
    this.tokenizer = new WordTokenizer();
    this.sourceReliabilityCache = new Map();
  }

  /**
   * Assess the quality of a content item
   */
  async assessContentQuality(
    content: ContentItem,
    options: QualityAssessmentOptions = {}
  ): Promise<ContentQualityMetrics> {
    logger.debug(`🔍 Assessing quality for: "${content.title}"`);

    const domain = options.domain || 'general';
    const includeContentAnalysis = options.includeContentAnalysis ?? true;

    // Calculate individual quality factors
    const factors = await this.calculateQualityFactors(content, options, includeContentAnalysis);

    // Get domain-specific weights
    const weights = {
      ...this.domainWeights.general,
      ...this.domainWeights[domain],
      ...options.customWeights,
    };

    // Calculate weighted overall score
    const overallScore = this.calculateWeightedScore(factors, weights);

    // Generate quality breakdown
    const breakdown = this.generateQualityBreakdown(content, factors, overallScore);

    const qualityMetrics: ContentQualityMetrics = {
      overallScore,
      factors,
      breakdown,
    };

    logger.info(
      `✅ Quality assessment completed: ${overallScore.toFixed(3)} for "${content.title}"`
    );
    return qualityMetrics;
  }

  /**
   * Assess source reliability
   */
  async assessSourceReliability(
    source: ContentSource,
    url?: string,
    _options: QualityAssessmentOptions = {}
  ): Promise<SourceReliabilityMetrics> {
    const cacheKey = `${source}-${url || 'default'}`;

    // Check cache first
    if (this.sourceReliabilityCache.has(cacheKey)) {
      return this.sourceReliabilityCache.get(cacheKey)!;
    }

    logger.debug(`🏛️ Assessing source reliability: ${source} ${url ? `(${url})` : ''}`);

    const factors = await this.calculateSourceFactors(source, url);
    const reliabilityScore = this.calculateSourceReliabilityScore(factors);
    const classification = this.classifySource(source, url, factors);

    const reliability: SourceReliabilityMetrics = {
      reliabilityScore,
      factors,
      classification,
    };

    // Cache the result
    this.sourceReliabilityCache.set(cacheKey, reliability);

    logger.info(`🎯 Source reliability: ${reliabilityScore.toFixed(3)} for ${source}`);
    return reliability;
  }

  /**
   * Batch assess multiple content items
   */
  async batchAssessQuality(
    contents: ContentItem[],
    options: QualityAssessmentOptions = {}
  ): Promise<ContentQualityMetrics[]> {
    logger.info(`📊 Batch assessing ${contents.length} content items`);

    const assessments = await Promise.all(
      contents.map(content => this.assessContentQuality(content, options))
    );

    return assessments;
  }

  /**
   * Get quality threshold recommendations for filtering
   */
  getQualityThresholds(domain = 'general'): {
    minimal: number;
    good: number;
    excellent: number;
  } {
    // Domain-specific quality thresholds
    const thresholds = {
      programming: { minimal: 0.3, good: 0.6, excellent: 0.85 },
      datascience: { minimal: 0.4, good: 0.65, excellent: 0.9 },
      general: { minimal: 0.25, good: 0.55, excellent: 0.8 },
    };

    return thresholds[domain as keyof typeof thresholds] || thresholds.general;
  }

  /**
   * Compare content quality between items
   */
  async compareQuality(
    content1: ContentItem,
    content2: ContentItem,
    options: QualityAssessmentOptions = {}
  ): Promise<{
    winner: 'content1' | 'content2' | 'tie';
    confidence: number;
    reasoning: string[];
  }> {
    const [quality1, quality2] = await Promise.all([
      this.assessContentQuality(content1, options),
      this.assessContentQuality(content2, options),
    ]);

    const scoreDiff = Math.abs(quality1.overallScore - quality2.overallScore);
    const winner =
      scoreDiff < 0.1
        ? 'tie'
        : quality1.overallScore > quality2.overallScore
          ? 'content1'
          : 'content2';

    const confidence = Math.min(scoreDiff * 2, 1); // Scale difference to confidence

    const reasoning: string[] = [];

    if (winner !== 'tie') {
      const betterContent = winner === 'content1' ? quality1 : quality2;
      const worseContent = winner === 'content1' ? quality2 : quality1;

      reasoning.push(
        `Overall quality score: ${betterContent.overallScore.toFixed(3)} vs ${worseContent.overallScore.toFixed(3)}`
      );

      // Add specific factor comparisons
      Object.entries(betterContent.factors).forEach(([factor, value]) => {
        const otherValue = worseContent.factors[factor as keyof typeof worseContent.factors];
        if (value - otherValue > 0.2) {
          reasoning.push(`Better ${factor}: ${value.toFixed(2)} vs ${otherValue.toFixed(2)}`);
        }
      });
    } else {
      reasoning.push('Quality scores are very close, indicating similar quality levels');
    }

    return { winner, confidence, reasoning };
  }

  /**
   * Calculate individual quality factors for content
   */
  private async calculateQualityFactors(
    content: ContentItem,
    options: QualityAssessmentOptions,
    includeContentAnalysis: boolean
  ): Promise<ContentQualityMetrics['factors']> {
    return {
      completeness: this.assessCompleteness(content),
      accuracy: includeContentAnalysis ? await this.assessAccuracy(content) : 0.7, // Default if not analyzed
      freshness: this.assessFreshness(content),
      credibility: this.assessCredibility(content),
      depth: includeContentAnalysis ? this.assessDepth(content) : 0.6, // Default if not analyzed
      technicalAccuracy: includeContentAnalysis ? await this.assessTechnicalAccuracy(content) : 0.7,
      readability: includeContentAnalysis ? this.assessReadability(content) : 0.75,
    };
  }

  /**
   * Assess content completeness based on structure and length
   */
  private assessCompleteness(content: ContentItem): number {
    let score = 0;

    // Word count factor
    const wordCount = content.metadata.wordCount || this.estimateWordCount(content.content);
    if (wordCount >= 500) score += 0.3;
    else if (wordCount >= 200) score += 0.2;
    else if (wordCount >= 100) score += 0.1;

    // Title presence and quality
    if (content.title && content.title.length > 10) score += 0.2;

    // Content structure
    if (content.content.includes('\n')) score += 0.1; // Has paragraphs
    if (content.content.match(/#{1,6}\s/g)) score += 0.1; // Has headers
    if (content.content.match(/```|`[^`]+`/g)) score += 0.1; // Has code blocks/inline code

    // Metadata completeness
    if (content.metadata.author) score += 0.1;
    if (content.metadata.publishDate) score += 0.1;
    if (content.metadata.tags && content.metadata.tags.length > 0) score += 0.1;

    return Math.min(score, 1);
  }

  /**
   * Assess accuracy through content analysis patterns
   */
  private async assessAccuracy(content: ContentItem): Promise<number> {
    let score = 0.5; // Base score

    // Look for accuracy indicators
    const text = content.content.toLowerCase();

    // Positive indicators
    if (text.match(/\b(source|reference|documentation|official)\b/g)) score += 0.2;
    if (text.match(/\b(example|demo|tutorial)\b/g)) score += 0.1;
    if (text.match(/\b(updated|current|latest|version)\b/g)) score += 0.1;

    // Negative indicators
    if (text.match(/\b(deprecated|old|outdated|legacy)\b/g)) score -= 0.2;
    if (text.match(/\b(maybe|probably|might|could)\b/g)) score -= 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Assess content freshness based on publish date
   */
  private assessFreshness(content: ContentItem): number {
    if (!content.metadata.publishDate) return 0.3; // Default for unknown date

    const now = new Date();
    const publishDate = content.metadata.publishDate;
    const ageInDays = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24);

    if (ageInDays < 30) return 1.0;
    if (ageInDays < 90) return 0.8;
    if (ageInDays < 365) return 0.6;
    if (ageInDays < 730) return 0.4;
    return 0.2;
  }

  /**
   * Assess author/source credibility
   */
  private assessCredibility(content: ContentItem): number {
    let score = 0.5; // Base score

    const author = content.metadata.author?.toLowerCase() || '';
    const url = content.url.toLowerCase();

    // Penalty for missing author
    if (!author || author === 'unknown' || author.length <= 2) {
      score -= 0.25; // Reduce credibility for anonymous content
    } else {
      score += 0.1; // Bonus for having a known author
    }

    // Domain-based credibility
    if (url.includes('github.com') || url.includes('stackoverflow.com')) score += 0.2;
    if (url.includes('.edu') || url.includes('.org')) score += 0.3;
    if (url.includes('docs.') || url.includes('developer.')) score += 0.2;

    return Math.max(0.1, Math.min(1, score)); // Ensure minimum credibility of 0.1
  }

  /**
   * Assess content depth and detail level
   */
  private assessDepth(content: ContentItem): number {
    const text = content.content;
    let score = 0;

    // Content length factor
    const wordCount = this.estimateWordCount(text);
    if (wordCount > 1000) score += 0.3;
    else if (wordCount > 500) score += 0.2;
    else if (wordCount > 200) score += 0.1;

    // Technical detail indicators
    if (text.match(/```[\s\S]*?```/g)) score += 0.2; // Code blocks
    if (text.match(/\b(function|class|method|algorithm|implementation)\b/gi)) score += 0.1;
    if (text.match(/\b(example|tutorial|step.?by.?step|walkthrough)\b/gi)) score += 0.2;

    // Structure indicators
    if (text.match(/#{2,6}/g)) score += 0.1; // Subsections
    if (text.match(/\n\s*[-*+]\s/g)) score += 0.1; // Lists

    return Math.min(1, score);
  }

  /**
   * Assess technical accuracy for technical content
   */
  private async assessTechnicalAccuracy(content: ContentItem): Promise<number> {
    const text = content.content.toLowerCase();
    let score = 0.6; // Base score

    // Look for technical accuracy indicators
    if (text.match(/\b(tested|working|verified|confirmed)\b/g)) score += 0.2;
    if (text.match(/\bversion\s+\d+/g)) score += 0.1;
    if (text.match(/\b(install|npm|pip|yarn|composer)\b/g)) score += 0.1;

    // Negative indicators
    if (text.match(/\b(broken|error|doesn.?t work|not working)\b/g)) score -= 0.3;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Assess readability and clarity
   */
  private assessReadability(content: ContentItem): number {
    const text = content.content;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    if (sentences.length === 0) return 0;

    let score = 0.5; // Base score

    // Average sentence length (prefer moderate length)
    const avgSentenceLength = text.split(' ').length / sentences.length;
    if (avgSentenceLength >= 10 && avgSentenceLength <= 25) score += 0.2;
    else if (avgSentenceLength <= 40) score += 0.1;

    // Paragraph structure
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    if (paragraphs.length > 1) score += 0.1;

    // Use of formatting
    if (text.match(/\*\*[^*]+\*\*|__[^_]+__/g)) score += 0.1; // Bold
    if (text.match(/\*[^*]+\*|_[^_]+_/g)) score += 0.05; // Italic
    if (text.match(/`[^`]+`/g)) score += 0.1; // Inline code

    return Math.min(1, score);
  }

  /**
   * Calculate source reliability factors
   */
  private async calculateSourceFactors(
    source: ContentSource,
    url?: string
  ): Promise<SourceReliabilityMetrics['factors']> {
    const domain = url ? new URL(url).hostname : '';

    return {
      authority: this.assessDomainAuthority(source, domain),
      consistency: this.assessConsistency(source),
      validation: this.assessValidation(source, domain),
      maintenance: this.assessMaintenance(source),
      communityTrust: this.assessCommunityTrust(source, domain),
    };
  }

  /**
   * Assess domain authority based on source and URL
   */
  private assessDomainAuthority(source: ContentSource, domain: string): number {
    // High authority domains
    const highAuthority = [
      'github.com',
      'stackoverflow.com',
      'developer.mozilla.org',
      'docs.python.org',
      'nodejs.org',
      'reactjs.org',
      'angular.io',
    ];

    // Medium authority domains
    const mediumAuthority = ['medium.com', 'dev.to', 'hashnode.com', 'freecodecamp.org'];

    if (highAuthority.some(d => domain.includes(d))) return 0.9;
    if (mediumAuthority.some(d => domain.includes(d))) return 0.7;
    if (domain.includes('.edu') || domain.includes('.org')) return 0.8;
    if (source === ContentSource.GITHUB) return 0.8;
    if (source === ContentSource.STACKOVERFLOW) return 0.85;

    return 0.5; // Default
  }

  /**
   * Assess source consistency over time
   */
  private assessConsistency(source: ContentSource): number {
    // Based on known source characteristics
    const consistencyMap: Record<ContentSource, number> = {
      [ContentSource.GITHUB]: 0.8,
      [ContentSource.STACKOVERFLOW]: 0.85,
      [ContentSource.WEB]: 0.6,
      [ContentSource.YOUTUBE]: 0.6,
      [ContentSource.REDDIT]: 0.5,
      [ContentSource.DOCUMENTATION]: 0.9,
      [ContentSource.TECH_BLOG]: 0.7,
      [ContentSource.ACADEMIC_PAPER]: 0.95,
      [ContentSource.TUTORIAL]: 0.7,
      [ContentSource.LOCAL_FILE]: 0.8,
    };

    return consistencyMap[source] || 0.5;
  }

  /**
   * Assess peer validation (citations, references)
   */
  private assessValidation(source: ContentSource, domain: string): number {
    if (source === ContentSource.STACKOVERFLOW) return 0.9; // High peer validation
    if (source === ContentSource.GITHUB) return 0.7; // Some validation through stars/forks
    if (domain.includes('.edu') || domain.includes('research')) return 0.8;

    return 0.5; // Default
  }

  /**
   * Assess update frequency and maintenance
   */
  private assessMaintenance(source: ContentSource): number {
    const maintenanceMap: Record<ContentSource, number> = {
      [ContentSource.GITHUB]: 0.8,
      [ContentSource.STACKOVERFLOW]: 0.7,
      [ContentSource.WEB]: 0.6,
      [ContentSource.YOUTUBE]: 0.5,
      [ContentSource.REDDIT]: 0.4,
      [ContentSource.DOCUMENTATION]: 0.85,
      [ContentSource.TECH_BLOG]: 0.6,
      [ContentSource.ACADEMIC_PAPER]: 0.3,
      [ContentSource.TUTORIAL]: 0.5,
      [ContentSource.LOCAL_FILE]: 0.9,
    };

    return maintenanceMap[source] || 0.5;
  }

  /**
   * Assess community trust and engagement
   */
  private assessCommunityTrust(source: ContentSource, domain: string): number {
    if (source === ContentSource.STACKOVERFLOW) return 0.9;
    if (source === ContentSource.GITHUB) return 0.8;
    if (source === ContentSource.REDDIT) return 0.6;
    if (domain.includes('official') || domain.includes('docs.')) return 0.85;

    return 0.5;
  }

  /**
   * Calculate weighted overall score from factors
   */
  private calculateWeightedScore(
    factors: ContentQualityMetrics['factors'],
    weights: Partial<Record<keyof ContentQualityMetrics['factors'], number>>
  ): number {
    let score = 0;
    let totalWeight = 0;

    Object.entries(factors).forEach(([factor, value]) => {
      const weight = weights[factor as keyof typeof weights] || 0.14; // Default equal weight
      score += value * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  /**
   * Calculate source reliability score
   */
  private calculateSourceReliabilityScore(factors: SourceReliabilityMetrics['factors']): number {
    return (
      factors.authority * 0.3 +
      factors.consistency * 0.2 +
      factors.validation * 0.2 +
      factors.maintenance * 0.15 +
      factors.communityTrust * 0.15
    );
  }

  /**
   * Classify source type and confidence
   */
  private classifySource(
    source: ContentSource,
    url?: string,
    factors?: SourceReliabilityMetrics['factors']
  ): SourceReliabilityMetrics['classification'] {
    const domain = url ? new URL(url).hostname : '';

    // Official sources
    if (domain.includes('docs.') || domain.includes('developer.') || domain.includes('official')) {
      return {
        type: 'official',
        confidence: 0.9,
        reasoning: ['Domain indicates official documentation or developer resources'],
      };
    }

    // Academic sources
    if (domain.includes('.edu') || domain.includes('research') || domain.includes('academic')) {
      return {
        type: 'academic',
        confidence: 0.85,
        reasoning: ['Educational or research domain'],
      };
    }

    // Community sources
    if (source === ContentSource.STACKOVERFLOW || source === ContentSource.REDDIT) {
      return {
        type: 'community',
        confidence: 0.8,
        reasoning: ['Community-driven Q&A or discussion platform'],
      };
    }

    // Commercial sources
    if (
      source === ContentSource.TECH_BLOG ||
      (domain.includes('.com') && factors && factors.authority > 0.7)
    ) {
      return {
        type: 'commercial',
        confidence: 0.7,
        reasoning: ['Commercial domain with high authority'],
      };
    }

    // Default to unknown
    return {
      type: 'unknown',
      confidence: 0.3,
      reasoning: ['Unable to determine source type with confidence'],
    };
  }

  /**
   * Generate quality breakdown with strengths, weaknesses, and recommendations
   */
  private generateQualityBreakdown(
    content: ContentItem,
    factors: ContentQualityMetrics['factors'],
    overallScore: number
  ): ContentQualityMetrics['breakdown'] {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Identify strengths (factors > 0.7)
    Object.entries(factors).forEach(([factor, value]) => {
      if (value > 0.7) {
        strengths.push(`Strong ${factor}: ${(value * 100).toFixed(0)}%`);
      } else if (value < 0.4) {
        weaknesses.push(`Weak ${factor}: ${(value * 100).toFixed(0)}%`);
      }
    });

    // Generate recommendations based on weaknesses
    if (factors.completeness < 0.5) {
      recommendations.push('Consider adding more detailed content and examples');
    }
    if (factors.freshness < 0.4) {
      recommendations.push('Content may be outdated - verify current relevance');
    }
    if (factors.depth < 0.5) {
      recommendations.push('Could benefit from more technical depth and detail');
    }
    if (factors.readability < 0.5) {
      recommendations.push('Improve formatting and structure for better readability');
    }

    // Overall recommendations
    if (overallScore < 0.3) {
      recommendations.push('Consider finding alternative sources with higher quality');
    } else if (overallScore < 0.6) {
      recommendations.push('Use with caution - supplement with additional sources');
    }

    return { strengths, weaknesses, recommendations };
  }

  /**
   * Estimate word count from text
   */
  private estimateWordCount(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
}
