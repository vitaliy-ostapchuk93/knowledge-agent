/**
 * Content Relevance Scoring Engine
 * Calculates relevance scores for discovered content based on multiple factors
 * Enhanced with professional NLP libraries for better semantic understanding
 */

import { DiscoveredContent, ContentSource } from '@/types/index.ts';
import { logger } from '@/utils/logger.ts';
import { WordTokenizer, SentimentAnalyzer, PorterStemmer as Stemmer, TfIdf } from 'natural';
import { compareTwoStrings } from 'string-similarity';
import { removeStopwords, eng } from 'stopword';
import compromise from 'compromise';
import { stemmer } from 'stemmer';

export interface RelevanceFactors {
  titleMatch: number;
  contentMatch: number;
  sourceReliability: number;
  recency: number;
  popularity: number;
  contentQuality: number;
}

export interface ScoringWeights {
  titleMatch: number;
  contentMatch: number;
  sourceReliability: number;
  recency: number;
  popularity: number;
  contentQuality: number;
}

export interface ScoringOptions {
  weights?: Partial<ScoringWeights>;
  queryTerms?: string[];
  preferredSources?: ContentSource[];
  minScore?: number;
}

export class ContentRelevanceScorer {
  private readonly defaultWeights: ScoringWeights = {
    titleMatch: 0.3,
    contentMatch: 0.25,
    sourceReliability: 0.15,
    recency: 0.1,
    popularity: 0.1,
    contentQuality: 0.1,
  };

  private readonly sourceReliabilityScores: Record<ContentSource, number> = {
    [ContentSource.DOCUMENTATION]: 0.95,
    [ContentSource.ACADEMIC_PAPER]: 0.9,
    [ContentSource.GITHUB]: 0.85,
    [ContentSource.STACKOVERFLOW]: 0.8,
    [ContentSource.TECH_BLOG]: 0.75,
    [ContentSource.TUTORIAL]: 0.7,
    [ContentSource.YOUTUBE]: 0.65,
    [ContentSource.REDDIT]: 0.6,
    [ContentSource.WEB]: 0.5,
    [ContentSource.LOCAL_FILE]: 0.8,
  };

  // NLP components for enhanced text analysis
  private readonly tokenizer: WordTokenizer;
  private readonly tfidf: TfIdf;
  private readonly sentimentAnalyzer: SentimentAnalyzer;

  constructor() {
    this.tokenizer = new WordTokenizer();
    this.tfidf = new TfIdf();
        this.sentimentAnalyzer = new SentimentAnalyzer('English', Stemmer, 'afinn');
  }

  /**
   * Calculate relevance score for content based on query and options
   */
  async calculateRelevance(
    content: DiscoveredContent,
    query: string,
    options: ScoringOptions = {}
  ): Promise<number> {
    try {
      const weights = { ...this.defaultWeights, ...options.weights };
      const queryTerms = options.queryTerms || this.extractQueryTerms(query);

      const factors = await this.calculateFactors(content, query, queryTerms, options);

      const score =
        factors.titleMatch * weights.titleMatch +
        factors.contentMatch * weights.contentMatch +
        factors.sourceReliability * weights.sourceReliability +
        factors.recency * weights.recency +
        factors.popularity * weights.popularity +
        factors.contentQuality * weights.contentQuality;

      // Normalize to 0-1 range
      const normalizedScore = Math.max(0, Math.min(1, score));

      logger.debug(`📊 Relevance calculated for "${content.title}": ${normalizedScore.toFixed(3)}`);

      return normalizedScore;
    } catch (error) {
      logger.error('Error calculating content relevance:', error);
      return 0.1; // Default low score on error
    }
  }

  /**
   * Score multiple content items and sort by relevance
   */
  async scoreAndSort(
    contents: DiscoveredContent[],
    query: string,
    options: ScoringOptions = {}
  ): Promise<DiscoveredContent[]> {
    logger.debug(`📊 Scoring ${contents.length} content items for relevance`);

    const scoredContents = await Promise.all(
      contents.map(async content => {
        const score = await this.calculateRelevance(content, query, options);
        return {
          ...content,
          relevanceScore: score,
        };
      })
    );

    // Filter by minimum score if specified
    const filtered = options.minScore
      ? scoredContents.filter(c => c.relevanceScore >= options.minScore!)
      : scoredContents;

    // Sort by relevance score (highest first)
    return filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Calculate all relevance factors for content
   */
  private async calculateFactors(
    content: DiscoveredContent,
    query: string,
    queryTerms: string[],
    options: ScoringOptions
  ): Promise<RelevanceFactors> {
    return {
      titleMatch: this.calculateTitleMatch(content.title, queryTerms),
      contentMatch: this.calculateContentMatch(content.content, queryTerms),
      sourceReliability: this.calculateSourceReliability(content.source, options),
      recency: this.calculateRecency(content),
      popularity: this.calculatePopularity(content),
      contentQuality: this.calculateEnhancedContentQuality(content), // Use enhanced version
    };
  }

  /**
   * Calculate how well the title matches query terms using enhanced NLP
   */
  private calculateTitleMatch(title: string, queryTerms: string[]): number {
    const titleLower = title.toLowerCase();
    let matchScore = 0;

    // Basic exact matching (existing logic)
    for (const term of queryTerms) {
      const termLower = term.toLowerCase();

      // Exact match in title (high weight)
      if (titleLower.includes(termLower)) {
        matchScore += 1;
      }

      // Partial word match (medium weight)
      const words = titleLower.split(/\s+/);
      const partialMatches = words.filter(
        word => word.includes(termLower) || termLower.includes(word)
      ).length;
      matchScore += partialMatches * 0.5;
    }

    // Enhanced: Use semantic similarity
    const semanticScore = this.calculateSemanticSimilarity(title, queryTerms.join(' '));
    matchScore += semanticScore * 0.8; // Weight semantic similarity

    // Enhanced: Use stemming for better matching
    const stemmedScore = this.calculateStemmedMatch(title, queryTerms);
    matchScore += stemmedScore * 0.6;

    // Normalize by number of query terms
    return Math.min(1, matchScore / Math.max(queryTerms.length, 1));
  }

  /**
   * Calculate how well the content matches query terms using enhanced NLP
   */
  private calculateContentMatch(content: string, queryTerms: string[]): number {
    const contentLower = content.toLowerCase();
    let matchScore = 0;
    const totalWords = contentLower.split(/\s+/).length;

    // Basic keyword density (existing logic)
    for (const term of queryTerms) {
      const termLower = term.toLowerCase();
      const matches = (contentLower.match(new RegExp(termLower, 'g')) || []).length;
      matchScore += matches;
    }

    // Enhanced: TF-IDF scoring for better content relevance
    const tfidfScore = this.calculateTfIdfScore(content, queryTerms);
    matchScore += tfidfScore * totalWords * 0.5;

    // Enhanced: Named entity and concept extraction
    const conceptScore = this.calculateConceptMatch(content, queryTerms);
    matchScore += conceptScore * 2;

    // Normalize by content length and query terms
    const density = matchScore / (totalWords * Math.max(queryTerms.length, 1));
    return Math.min(1, density * 100); // Scale up density
  }

  /**
   * Calculate source reliability score
   */
  private calculateSourceReliability(source: ContentSource, options: ScoringOptions): number {
    let baseScore = this.sourceReliabilityScores[source] || 0.5;

    // Boost score if source is in preferred sources
    if (options.preferredSources?.includes(source)) {
      baseScore = Math.min(1, baseScore * 1.2);
    }

    return baseScore;
  }

  /**
   * Calculate recency score based on content age
   */
  private calculateRecency(content: DiscoveredContent): number {
    // Check if we have a publish date in metadata
    const publishDate = content.metadata.publishDate as Date;
    if (!publishDate || !(publishDate instanceof Date)) {
      return 0.5; // Default score if no date available
    }

    const now = new Date();
    const ageInDays = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24);

    // Score decreases with age, but levels off after a year
    if (ageInDays <= 7) return 1.0; // This week
    if (ageInDays <= 30) return 0.9; // This month
    if (ageInDays <= 90) return 0.8; // This quarter
    if (ageInDays <= 365) return 0.6; // This year
    return 0.4; // Older than a year
  }

  /**
   * Calculate popularity score based on engagement metrics
   */
  private calculatePopularity(content: DiscoveredContent): number {
    const metadata = content.metadata;

    // Different metrics based on source
    const viewCount = (metadata.viewCount as number) || 0;
    const score = (metadata.score as number) || 0;
    const commentCount = (metadata.commentCount as number) || 0;

    // Normalize popular metrics to 0-1 scale
    let popularityScore = 0.5; // Default

    if (viewCount > 0) {
      // YouTube views: scale logarithmically
      popularityScore = Math.min(1, Math.log10(viewCount) / 6); // 1M views = 1.0
    } else if (score > 0) {
      // Reddit/StackOverflow scores
      popularityScore = Math.min(1, score / 100); // 100 points = 1.0
    } else if (commentCount > 0) {
      // Comment engagement
      popularityScore = Math.min(1, commentCount / 50); // 50 comments = 1.0
    }

    return popularityScore;
  }

  /**
   * Calculate content quality score
   */
  private calculateContentQuality(content: DiscoveredContent): number {
    let qualityScore = 0.5; // Base score

    // Content length (optimal range scoring)
    const wordCount = content.content.split(/\s+/).length;
    if (wordCount >= 100 && wordCount <= 2000) {
      qualityScore += 0.2; // Good length
    } else if (wordCount > 2000 && wordCount <= 5000) {
      qualityScore += 0.1; // Long but acceptable
    }

    // Title quality (descriptive titles)
    const titleWordCount = content.title.split(/\s+/).length;
    if (titleWordCount >= 3 && titleWordCount <= 15) {
      qualityScore += 0.1;
    }

    // Has tags or categories
    if (content.tags && content.tags.length > 0) {
      qualityScore += 0.1;
    }

    // Has URL (external content)
    if (content.url && content.url.startsWith('http')) {
      qualityScore += 0.1;
    }

    return Math.min(1, qualityScore);
  }

  /**
   * Extract meaningful query terms from search query using enhanced NLP
   */
  private extractQueryTerms(query: string): string[] {
    // Use stopword library for better stop word removal
    const words = this.tokenizer.tokenize(query.toLowerCase()) || [];
    const cleanWords = removeStopwords(words, eng);

    // Stem words for better matching
    return cleanWords
      .filter(term => term.length > 2)
      .map(term => stemmer(term))
      .filter(term => term.length > 0);
  }

  /**
   * Calculate semantic similarity using string similarity algorithms
   */
  private calculateSemanticSimilarity(text1: string, text2: string): number {
    try {
      // Use string-similarity for semantic matching
      return compareTwoStrings(text1.toLowerCase(), text2.toLowerCase());
    } catch (error) {
      logger.debug('Error calculating semantic similarity:', error);
      return 0;
    }
  }

  /**
   * Calculate stemmed word matching for better linguistic coverage
   */
  private calculateStemmedMatch(text: string, queryTerms: string[]): number {
    const textWords = this.tokenizer.tokenize(text.toLowerCase()) || [];
    const stemmedTextWords = textWords.map(word => stemmer(word));
    const stemmedQueryTerms = queryTerms.map(term => stemmer(term));

    let matches = 0;
    for (const queryTerm of stemmedQueryTerms) {
      if (stemmedTextWords.includes(queryTerm)) {
        matches++;
      }
    }

    return matches / Math.max(stemmedQueryTerms.length, 1);
  }

  /**
   * Calculate TF-IDF based relevance score
   */
  private calculateTfIdfScore(content: string, queryTerms: string[]): number {
    try {
      // Add content to TF-IDF corpus for analysis
      this.tfidf.addDocument(content);

      let totalScore = 0;
      for (const term of queryTerms) {
        const score = this.tfidf.tfidf(term, 0); // Get TF-IDF for first document
        totalScore += score;
      }

      // Clean up - remove the document we just added
      this.tfidf.documents.pop();

      return totalScore / Math.max(queryTerms.length, 1);
    } catch (error) {
      logger.debug('Error calculating TF-IDF score:', error);
      return 0;
    }
  }

  /**
   * Calculate concept matching using NLP concept extraction
   */
  private calculateConceptMatch(content: string, queryTerms: string[]): number {
    try {
      // Use compromise.js for concept extraction
      const doc = compromise(content);

      // Extract key concepts (nouns, entities, topics)
      const nouns = doc.nouns().out('array');
      const topics = doc.topics().out('array');
      const concepts = [...nouns, ...topics].map(c => c.toLowerCase());

      let matches = 0;
      for (const queryTerm of queryTerms) {
        const termLower = queryTerm.toLowerCase();

        // Direct concept match
        if (concepts.includes(termLower)) {
          matches += 1;
        }

        // Partial concept match
        const partialMatches = concepts.filter(
          concept => concept.includes(termLower) || termLower.includes(concept)
        ).length;
        matches += partialMatches * 0.5;
      }

      return matches / Math.max(queryTerms.length, 1);
    } catch (error) {
      logger.debug('Error calculating concept match:', error);
      return 0;
    }
  }

  /**
   * Enhanced content quality calculation with NLP insights
   */
  private calculateEnhancedContentQuality(content: DiscoveredContent): number {
    let qualityScore = this.calculateContentQuality(content); // Use existing base calculation

    try {
      // Sentiment analysis - neutral to positive content is preferred
      const tokens = this.tokenizer.tokenize(content.content) || [];
      const sentiment = this.sentimentAnalyzer.getSentiment(tokens);

      // Boost slightly positive content, neutral is fine, avoid very negative
      if (sentiment > 0.1) {
        qualityScore += 0.1;
      } else if (sentiment < -0.3) {
        qualityScore -= 0.1;
      }

      // Linguistic complexity analysis using compromise
      const doc = compromise(content.content);
      const sentences = doc.sentences().length;
      const words = doc.terms().length;

      // Average sentence length (good readability indicator)
      const avgSentenceLength = words / Math.max(sentences, 1);
      if (avgSentenceLength >= 10 && avgSentenceLength <= 25) {
        qualityScore += 0.1; // Good readability
      }

      // Entity richness (more entities often means more informative content)
      const entities = doc.topics().length + doc.people().length + doc.places().length;
      const entityDensity = entities / Math.max(words, 1);
      if (entityDensity > 0.02 && entityDensity < 0.1) {
        qualityScore += 0.1; // Good entity richness
      }
    } catch (error) {
      logger.debug('Error in enhanced quality calculation:', error);
    }

    return Math.min(1, qualityScore);
  }

  /**
   * Get relevance factors breakdown for debugging
   */
  async getRelevanceBreakdown(
    content: DiscoveredContent,
    query: string,
    options: ScoringOptions = {}
  ): Promise<RelevanceFactors> {
    const queryTerms = options.queryTerms || this.extractQueryTerms(query);
    return this.calculateFactors(content, query, queryTerms, options);
  }
}
