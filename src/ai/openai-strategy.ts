/**
 * OpenAI Processing Strategy
 * Provides AI-powered content processing using OpenAI's API with enhanced NLP fallbacks
 */

import { IProcessingStrategy } from '@/interfaces/index.ts';
import {
  Summary,
  ProcessingStrategy,
  ProcessingOptions,
  Analysis,
  CodeExample,
  RelatedLink,
} from '@/types/index.ts';
import { logger } from '@/utils/logger.ts';
import { OpenAI } from 'openai';
import { WordTokenizer, SentimentAnalyzer, PorterStemmer as Stemmer, TfIdf } from 'natural';
import { removeStopwords, eng } from 'stopword';
import compromise from 'compromise';
import {
  TECHNICAL_TERMS,
  TECHNICAL_PATTERNS,
  /* detectTechnicalTerms, */ assessContentComplexity,
} from '@/utils/terms-config.ts';
import {
  enhancedSentiment,
  enhancedTextAnalyzer,
  // enhancedLanguageProcessor,
} from '@/utils/nlp-enhanced.ts';

export class OpenAIStrategy implements IProcessingStrategy {
  readonly strategyType = ProcessingStrategy.CLOUD;
  private readonly openai: OpenAI;
  private readonly model: string;

  // Enhanced NLP components for better fallback processing
  private readonly tokenizer: WordTokenizer;
  private readonly sentimentAnalyzer: SentimentAnalyzer;
  private readonly tfidf: TfIdf;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    this.openai = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    // Initialize NLP components
    this.tokenizer = new WordTokenizer();
    this.sentimentAnalyzer = new SentimentAnalyzer('English', Stemmer, 'afinn');
    this.tfidf = new TfIdf();

    logger.debug(`🤖 OpenAI Strategy initialized with model: ${this.model}`);
  }

  /**
   * Summarize content using OpenAI
   */
  async summarize(content: string, options?: ProcessingOptions): Promise<Summary> {
    try {
      const maxTokens = options?.maxTokens || 1000;
      const temperature = options?.temperature || 0.3;

      const systemPrompt = this.createSummarizationPrompt();

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: this.truncateContent(content, 12000) },
        ],
        max_tokens: maxTokens,
        temperature,
      });

      const summaryText = response.choices[0]?.message?.content || 'Failed to generate summary';

      // Parse the structured response
      const parsedSummary = this.parseSummaryResponse(summaryText);

      const summary: Summary = {
        id: `summary-${Date.now()}`,
        originalContent: [], // Will be populated by the caller
        keyPoints: parsedSummary.keyPoints,
        codeExamples: (parsedSummary.codeExamples as CodeExample[]) || [],
        links: (parsedSummary.links as RelatedLink[]) || [],
        tags: parsedSummary.tags || [],
        difficulty:
          (parsedSummary.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
        estimatedReadTime: this.estimateReadTime(summaryText),
        generatedAt: new Date(),
        summary: parsedSummary.summary,
        actionableItems: parsedSummary.actionableItems,
      };

      logger.debug(`🤖 Generated AI summary (${summaryText.length} chars)`);
      return summary;
    } catch (error) {
      logger.error('❌ Action item generation failed:', error);
      throw new Error(`AI summarization failed: ${(error as Error).message}`);
    }
  }

  /**
   * Analyze content characteristics
   */
  async analyze(content: string): Promise<Analysis> {
    try {
      const systemPrompt = `You are an expert content analyzer. Analyze the given content and return a JSON object with the following structure:
{
  "sentiment": "positive" | "neutral" | "negative",
  "complexity": "low" | "medium" | "high",
  "topics": ["topic1", "topic2", ...],
  "keyEntities": ["entity1", "entity2", ...],
  "readingLevel": 1-10
}`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: this.truncateContent(content, 8000) },
        ],
        max_tokens: 500,
        temperature: 0.1,
      });

      const analysisText = response.choices[0]?.message?.content || '{}';

      try {
        const analysis = JSON.parse(analysisText) as Analysis;
        logger.debug(
          `🔍 Analyzed content: ${analysis.complexity} complexity, ${analysis.topics.length} topics`
        );
        return analysis;
      } catch {
        // Enhanced fallback analysis using NLP libraries
        return this.analyzeWithNLP(content);
      }
    } catch (error) {
      logger.error('❌ Content analysis failed:', error);
      // Use NLP fallback instead of throwing error
      return this.analyzeWithNLP(content);
    }
  }

  /**
   * Enhanced NLP-based analysis fallback with multi-method sentiment analysis
   */
  private analyzeWithNLP(content: string): Analysis {
    try {
      // Use enhanced sentiment analysis for more accurate results
      const sentimentResult = enhancedSentiment.analyzeSentiment(content);

      // Convert enhanced sentiment result to expected format
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      if (sentimentResult.confidence > 0.6) {
        // Only use high confidence results
        sentiment = sentimentResult.sentiment;
      } else {
        // Fallback to natural sentiment analysis for low confidence
        const tokens = this.tokenizer.tokenize(content) || [];
        const sentimentScore = this.sentimentAnalyzer.getSentiment(tokens);
        if (sentimentScore > 0.1) sentiment = 'positive';
        else if (sentimentScore < -0.1) sentiment = 'negative';
      }

      return {
        sentiment,
        complexity: this.assessComplexity(content),
        topics: this.extractTopicsWithNLP(content),
        keyEntities: this.extractEntitiesWithNLP(content),
        readingLevel: this.calculateReadingLevel(content),
      };
    } catch (error) {
      logger.debug('Enhanced NLP analysis failed, using simple fallback:', error);
      return {
        sentiment: 'neutral',
        complexity: 'medium',
        topics: this.extractSimpleTopics(content),
        keyEntities: [],
        readingLevel: 5,
      };
    }
  }

  /**
   * Extract key information
   */
  async extractKeyPoints(content: string): Promise<string[]> {
    try {
      const systemPrompt = `Extract the most important key points from the content. Return them as a JSON array of strings, with each key point being concise and actionable.`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: this.truncateContent(content, 8000) },
        ],
        max_tokens: 800,
        temperature: 0.2,
      });

      const keyPointsText = response.choices[0]?.message?.content || '[]';

      try {
        const keyPoints = JSON.parse(keyPointsText) as string[];
        return keyPoints.slice(0, 10); // Limit to 10 key points
      } catch {
        // Fallback to enhanced extraction
        return this.extractEnhancedKeyPoints(content);
      }
    } catch (error) {
      logger.error('❌ Key point extraction failed:', error);
      return this.extractEnhancedKeyPoints(content);
    }
  }

  /**
   * Generate actionable items
   */
  async generateActionableItems(content: string): Promise<string[]> {
    try {
      const systemPrompt = `Based on the content, generate specific, actionable next steps that a reader could take. Return them as a JSON array of strings. Each item should be concrete and implementable.`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: this.truncateContent(content, 8000) },
        ],
        max_tokens: 600,
        temperature: 0.3,
      });

      const actionItemsText = response.choices[0]?.message?.content || '[]';

      try {
        const actionItems = JSON.parse(actionItemsText) as string[];
        return actionItems.slice(0, 8); // Limit to 8 action items
      } catch {
        // Fallback to generic action items
        return [
          'Review the key concepts mentioned',
          'Practice the techniques discussed',
          'Research related topics for deeper understanding',
        ];
      }
    } catch (error) {
      logger.error('❌ Action item generation failed:', error);
      return [
        'Review the content thoroughly',
        'Take notes on important points',
        'Apply the concepts in practice',
      ];
    }
  }

  /**
   * Check if strategy is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Test with a simple request
      await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      });
      return true;
    } catch (error) {
      logger.warn('⚠️ OpenAI strategy not available:', (error as Error).message);
      return false;
    }
  }

  /**
   * Create system prompt for summarization
   */
  private createSummarizationPrompt(): string {
    return `You are an expert knowledge curator specializing in technical content. Your task is to create comprehensive, actionable summaries.

Return your response in the following JSON format:
{
  "summary": "Main summary text (2-3 paragraphs)",
  "keyPoints": ["point1", "point2", ...],
  "actionableItems": ["action1", "action2", ...],
  "tags": ["tag1", "tag2", ...],
  "difficulty": "beginner" | "intermediate" | "advanced",
  "codeExamples": [{"language": "lang", "code": "code", "description": "desc"}],
  "links": [{"title": "title", "url": "url", "description": "desc", "relationship": "related"}]
}

Guidelines:
- Summary should be comprehensive yet concise
- Key points should be specific and memorable
- Action items should be concrete next steps
- Tags should be relevant technical keywords
- Include code examples if present in the content
- Assess difficulty based on technical complexity`;
  }

  /**
   * Parse structured summary response from AI
   */
  private parseSummaryResponse(response: string): {
    summary: string;
    keyPoints: string[];
    actionableItems: string[];
    codeExamples?: unknown[];
    links?: unknown[];
    tags?: string[];
    difficulty?: string;
  } {
    try {
      const parsed = JSON.parse(response);
      return {
        summary: parsed.summary || response,
        keyPoints: parsed.keyPoints || [],
        actionableItems: parsed.actionableItems || [],
        tags: parsed.tags || [],
        difficulty: parsed.difficulty || 'intermediate',
        codeExamples: parsed.codeExamples || [],
        links: parsed.links || [],
      };
    } catch {
      // Fallback parsing if JSON fails
      return {
        summary: response,
        keyPoints: this.extractSimpleKeyPoints(response),
        actionableItems: ['Review the content', 'Apply the concepts'],
        tags: this.extractSimpleTopics(response),
        difficulty: 'intermediate',
        codeExamples: [],
        links: [],
      };
    }
  }

  /**
   * Truncate content to fit within token limits
   */
  private truncateContent(content: string, maxChars: number): string {
    if (content.length <= maxChars) {
      return content;
    }

    // Try to cut at a sentence boundary
    const truncated = content.substring(0, maxChars);
    const lastSentence = truncated.lastIndexOf('.');

    if (lastSentence > maxChars * 0.8) {
      return truncated.substring(0, lastSentence + 1);
    }

    return truncated + '...';
  }

  /**
   * Estimate reading time in minutes
   */
  private estimateReadTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Enhanced topic extraction using advanced NLP analysis with TF-IDF
   */
  private extractTopicsWithNLP(content: string): string[] {
    try {
      // Use enhanced text analyzer for sophisticated topic extraction
      const enhancedTopics = enhancedTextAnalyzer.extractTopics(content, 6);

      if (enhancedTopics.length > 0) {
        // Convert enhanced topics to simple string array, prioritizing high-confidence results
        const topicStrings = enhancedTopics
          .filter(topic => topic.relevance > 0.1) // Only include significant topics
          .map(topic => topic.topic);

        if (topicStrings.length >= 3) {
          return topicStrings.slice(0, 5);
        }
      }

      // Fallback to compromise.js extraction if enhanced method doesn't yield enough results
      const doc = compromise(content);
      const nouns = doc.nouns().out('array');
      const topics = doc.topics().out('array');
      const technologies = doc.match('#Technology').out('array');

      // Use natural tokenizer and stopword removal
      const tokens = this.tokenizer.tokenize(content.toLowerCase()) || [];
      const filteredTokens = removeStopwords(tokens, eng);

      // Count word frequencies
      const frequency: { [key: string]: number } = {};
      filteredTokens.forEach(word => {
        if (word.length > 3) {
          frequency[word] = (frequency[word] || 0) + 1;
        }
      });

      // Combine NLP-extracted terms with frequency analysis
      const nlpTerms = [...nouns, ...topics, ...technologies]
        .map(term => term.toLowerCase())
        .filter(term => term.length > 2);

      // Dynamic technical terms detection
      const techTerms = this.detectTechnicalTerms(content, filteredTokens);

      // Combine and score all terms
      const allTerms = [...nlpTerms, ...Object.keys(frequency)];
      const scoredTerms = allTerms.map(term => ({
        term,
        score:
          (frequency[term] || 0) +
          (techTerms.includes(term) ? 2 : 0) +
          (nlpTerms.includes(term) ? 1 : 0),
      }));

      return [
        ...new Set(
          scoredTerms
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(item => item.term)
        ),
      ].filter(term => term.length > 2);
    } catch (error) {
      logger.debug('Error in enhanced NLP topic extraction, falling back to simple method:', error);
      return this.extractSimpleTopics(content);
    }
  }

  /**
   * Enhanced entity extraction using advanced NLP analysis
   */
  private extractEntitiesWithNLP(content: string): string[] {
    try {
      // Use enhanced text analyzer for comprehensive entity extraction via topics
      const enhancedTopics = enhancedTextAnalyzer.extractTopics(content, 10);

      // Categorize enhanced topics into entities
      const entityTypes = {
        people: enhancedTopics.filter(t => t.category === 'person').map(t => t.topic),
        organizations: enhancedTopics.filter(t => t.category === 'organization').map(t => t.topic),
        technologies: enhancedTopics.filter(t => t.category === 'technology').map(t => t.topic),
        concepts: enhancedTopics
          .filter(t => t.category === 'concept')
          .map(t => t.topic)
          .slice(0, 3),
      };

      const allEntities = [
        ...entityTypes.people,
        ...entityTypes.organizations,
        ...entityTypes.technologies,
        ...entityTypes.concepts,
      ];

      // Filter and clean entities
      const cleanEntities = allEntities
        .filter(entity => entity && entity.length > 2)
        .filter(entity => entity.length < 50)
        .map(entity => entity.trim())
        .filter(entity => !/^\d+$/.test(entity))
        .filter(entity => !entity.includes('http'));

      // If enhanced extraction yields good results, use them
      if (cleanEntities.length >= 3) {
        return [...new Set(cleanEntities)].slice(0, 8);
      }

      // Fallback to compromise.js if enhanced method doesn't yield enough results
      const doc = compromise(content);
      const people = doc.people().out('array');
      const places = doc.places().out('array');
      const organizations = doc.organizations().out('array');
      const topics = doc.topics().out('array');

      const fallbackEntities = [...people, ...places, ...organizations, ...topics]
        .filter(entity => entity && entity.length > 2)
        .filter(entity => entity.length < 50)
        .map(entity => entity.trim())
        .filter(entity => !/^\d+$/.test(entity))
        .filter(entity => !entity.includes('http'));

      return [...new Set(fallbackEntities)].slice(0, 5);
    } catch (error) {
      logger.debug(
        'Error in enhanced NLP entity extraction, falling back to simple method:',
        error
      );
      return [];
    }
  }

  /**
   * Assess content complexity using multiple indicators
   */
  private assessComplexity(content: string): 'low' | 'medium' | 'high' {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);

    if (sentences.length === 0 || words.length === 0) return 'medium';

    const avgSentenceLength = words.length / sentences.length;
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

    // Technical complexity indicators using centralized config
    const complexity = assessContentComplexity(content);
    const complexTermCount = complexity === 'high' ? 3 : complexity === 'medium' ? 1 : 0;

    // Calculate complexity score
    let score = 0;
    if (avgSentenceLength > 20) score += 1;
    if (avgWordLength > 6) score += 1;
    if (complexTermCount >= 3) score += 2;
    else if (complexTermCount >= 1) score += 1;

    if (score >= 3) return 'high';
    if (score >= 1) return 'medium';
    return 'low';
  }

  /**
   * Calculate reading level using enhanced metrics
   */
  private calculateReadingLevel(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 5;

    // Simplified Flesch-Kincaid grade level
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    const gradeLevel = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;

    return Math.max(1, Math.min(10, Math.round(gradeLevel)));
  }

  /**
   * Count syllables in a word (simplified)
   */
  private countSyllables(word: string): number {
    const vowels = 'aeiouy';
    let count = 0;
    let previousWasVowel = false;

    for (const char of word.toLowerCase()) {
      const isVowel = vowels.includes(char);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }

    return Math.max(1, count);
  }

  /**
   * Enhanced key point extraction fallback
   */
  private extractEnhancedKeyPoints(content: string): string[] {
    try {
      // Clean content and extract meaningful points
      const cleanContent = content
        .replace(/^---[\s\S]*?---/m, '') // Remove frontmatter
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`[^`]*`/g, '') // Remove inline code
        .trim();

      // Use compromise.js to extract key sentences and concepts
      const doc = compromise(cleanContent);
      const sentences = doc.sentences().out('array');

      // Filter for meaningful sentences
      const meaningfulSentences = sentences
        .filter((sentence: string) => sentence.length > 20 && sentence.length < 150)
        .filter((sentence: string) => !sentence.includes('{') && !sentence.includes('}'))
        .slice(0, 5);

      if (meaningfulSentences.length >= 3) {
        return meaningfulSentences;
      }

      // Fallback to simple extraction
      return this.extractSimpleKeyPoints(content);
    } catch (error) {
      logger.debug('Enhanced key point extraction failed, using simple fallback:', error);
      return this.extractSimpleKeyPoints(content);
    }
  }

  /**
   * Dynamically detect technical terms from content
   */
  private detectTechnicalTerms(content: string, tokens: string[]): string[] {
    const lowerContent = content.toLowerCase();

    // Use centralized technical terms from terms-config
    const baseTechTerms = TECHNICAL_TERMS.coreConcepts;
    const languages = TECHNICAL_TERMS.languages;
    const tools = TECHNICAL_TERMS.tools;
    const formats = TECHNICAL_TERMS.formats;

    // Use centralized technical patterns instead of hardcoded ones
    const techPatterns = [
      ...TECHNICAL_PATTERNS.fileExtensions,
      ...TECHNICAL_PATTERNS.packageManagers,
      ...TECHNICAL_PATTERNS.protocols,
      ...TECHNICAL_PATTERNS.configFormats,
      ...TECHNICAL_PATTERNS.frameworks,
    ];

    const detectedTerms = new Set<string>();

    // Add base terms that appear in content
    baseTechTerms.forEach(term => {
      if (lowerContent.includes(term)) {
        detectedTerms.add(term);
      }
    });

    // Add languages that appear in content
    languages.forEach(lang => {
      if (lowerContent.includes(lang)) {
        detectedTerms.add(lang);
      }
    });

    // Add tools that appear in content
    tools.forEach(tool => {
      if (lowerContent.includes(tool)) {
        detectedTerms.add(tool);
      }
    });

    // Add formats that appear in content
    formats.forEach(format => {
      if (lowerContent.includes(format)) {
        detectedTerms.add(format);
      }
    });

    // Detect technical patterns
    techPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const clean = match.replace(/[^\w]/g, '').toLowerCase();
          if (clean.length > 2) {
            detectedTerms.add(clean);
          }
        });
      }
    });

    // Add frequently mentioned tokens that match technical terms from centralized config
    tokens.forEach(token => {
      if (token.length > 3) {
        // Check against all technical term categories
        const isInLanguages = TECHNICAL_TERMS.languages.some(
          (lang: string) => token.includes(lang) || lang.includes(token)
        );
        const isInConcepts = TECHNICAL_TERMS.coreConcepts.some(
          (concept: string) => token.includes(concept) || concept.includes(token)
        );
        const isInTools = TECHNICAL_TERMS.tools.some(
          (tool: string) => token.includes(tool) || tool.includes(tool)
        );
        const isInFormats = TECHNICAL_TERMS.formats.some(
          (format: string) => token.includes(format) || format.includes(token)
        );

        // Also check for common technical suffixes/patterns
        const hasTechPattern =
          token.endsWith('js') ||
          token.endsWith('ts') ||
          token.includes('config') ||
          token.includes('async');

        if (isInLanguages || isInConcepts || isInTools || isInFormats || hasTechPattern) {
          detectedTerms.add(token);
        }
      }
    });

    return Array.from(detectedTerms);
  }

  /**
   * Simple topic extraction fallback
   */
  private extractSimpleTopics(content: string): string[] {
    const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const frequency: { [key: string]: number } = {};

    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Simple key point extraction fallback
   */
  private extractSimpleKeyPoints(content: string): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 5).map(s => s.trim());
  }
}
