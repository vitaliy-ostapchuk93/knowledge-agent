/**
 * Mock AI Processing Strategy - No API Keys Required
 * Provides local AI-like functionality for demonstration purposes
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
import { WordTokenizer, SentimentAnalyzer, PorterStemmer as Stemmer } from 'natural';
import { removeStopwords, eng } from 'stopword';
import compromise from 'compromise';
import {
  TECHNICAL_TERMS,
  SENTIMENT_WORDS,
  DIFFICULTY_TERMS,
  detectTechnicalTerms,
  // getDifficultyTerms,
  // assessContentComplexity,
} from '@/utils/terms-config.ts';
import {
  enhancedSentiment,
  enhancedTextAnalyzer,
  enhancedLanguageProcessor,
} from '@/utils/nlp-enhanced.ts';

export class MockAIStrategy implements IProcessingStrategy {
  readonly strategyType = ProcessingStrategy.LOCAL;

  // NLP components for enhanced text processing
  private readonly tokenizer: WordTokenizer;
  private readonly sentimentAnalyzer: SentimentAnalyzer;

  constructor() {
    this.tokenizer = new WordTokenizer();
    this.sentimentAnalyzer = new SentimentAnalyzer('English', Stemmer, 'afinn');
  }

  /**
   * Summarize content using local processing
   */
  async summarize(content: string, _options?: ProcessingOptions): Promise<Summary> {
    logger.debug('🤖 Generating mock AI summary...');

    // Simulate processing delay
    await this.delay(500);

    const wordCount = content.split(/\s+/).length;

    // Extract key information
    const keyPoints = this.getKeyPointsSync(content);
    const tags = this.extractTags(content);
    const actionableItems = this.getActionableItemsSync(content);
    const difficulty = this.assessDifficulty(content);

    const summary: Summary = {
      id: `mock-summary-${Date.now()}`,
      originalContent: [],
      keyPoints,
      codeExamples: this.extractCodeExamples(content),
      links: this.extractLinks(content),
      tags,
      difficulty,
      estimatedReadTime: Math.ceil(wordCount / 200),
      generatedAt: new Date(),
      summary: this.generateSummaryText(content),
      actionableItems,
    };

    logger.debug(`📝 Generated mock summary with ${keyPoints.length} key points`);
    return summary;
  }

  /**
   * Analyze content characteristics using enhanced NLP
   */
  async analyze(content: string): Promise<Analysis> {
    await this.delay(200);

    try {
      // Use enhanced sentiment analysis
      const sentimentResult = enhancedSentiment.analyzeSentiment(content);

      const analysis: Analysis = {
        sentiment: sentimentResult.sentiment,
        complexity: this.assessComplexity(content),
        topics: this.extractTags(content).slice(0, 5),
        keyEntities: this.extractEntities(content),
        readingLevel: this.calculateReadingLevel(content),
      };

      return analysis;
    } catch (error) {
      logger.debug('Error in NLP analysis, falling back to simple analysis:', error);
      return this.analyzeSimple(content);
    }
  }

  /**
   * Simple fallback analysis
   */
  private analyzeSimple(content: string): Analysis {
    const words = content.toLowerCase().split(/\s+/);
    const positiveWords = SENTIMENT_WORDS.positive;
    const negativeWords = SENTIMENT_WORDS.negative;

    const positiveCount = words.filter(w => positiveWords.includes(w)).length;
    const negativeCount = words.filter(w => negativeWords.includes(w)).length;

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (positiveCount > negativeCount + 1) sentiment = 'positive';
    else if (negativeCount > positiveCount + 1) sentiment = 'negative';

    return {
      sentiment,
      complexity: this.assessComplexity(content),
      topics: this.extractTags(content).slice(0, 5),
      keyEntities: this.extractEntities(content),
      readingLevel: this.calculateReadingLevel(content),
    };
  }

  /**
   * Extract key information
   */
  async extractKeyPoints(content: string): Promise<string[]> {
    await this.delay(300);
    return this.getKeyPointsSync(content);
  }

  /**
   * Generate actionable items
   */
  async generateActionableItems(content: string): Promise<string[]> {
    await this.delay(200);
    return this.getActionableItemsSync(content);
  }

  /**
   * Check if strategy is available
   */
  async isAvailable(): Promise<boolean> {
    return true; // Always available
  }

  /**
   * Extract key points from content (synchronous)
   */
  private getKeyPointsSync(content: string): string[] {
    // Clean content and extract meaningful points
    const cleanContent = content
      .replace(/^---[\s\S]*?---/m, '') // Remove frontmatter
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]*`/g, '') // Remove inline code
      .trim();

    // Extract headers and list items as potential key points
    const headers = cleanContent.match(/^#{1,6}\s+(.+)$/gm) || [];
    const listItems = cleanContent.match(/^\s*[-*+]\s+(.+)$/gm) || [];
    const numberedItems = cleanContent.match(/^\s*\d+\.\s+(.+)$/gm) || [];

    // Clean and collect all potential points
    const allPoints = [
      ...headers.map(h => h.replace(/^#{1,6}\s+/, '').trim()),
      ...listItems.map(li => li.replace(/^\s*[-*+]\s+/, '').trim()),
      ...numberedItems.map(ni => ni.replace(/^\s*\d+\.\s+/, '').trim()),
    ];

    // Filter for meaningful content and avoid code fragments
    const meaningfulPoints = allPoints.filter(
      point =>
        point.length > 3 &&
        point.length < 80 &&
        !point.includes('{') &&
        !point.includes('}') &&
        !point.includes('()') &&
        !point.includes('===') &&
        /^[A-Z]/.test(point) // Starts with capital letter
    );

    // If we have meaningful points, use them
    if (meaningfulPoints.length >= 3) {
      return meaningfulPoints.slice(0, 5);
    }

    // Fallback: generate topic-based key points using enhanced language detection
    try {
      const detectedLanguages = enhancedLanguageProcessor.detectProgrammingLanguages(content);
      if (detectedLanguages.length > 0 && detectedLanguages[0].confidence > 0.6) {
        const primaryLanguage = detectedLanguages[0].language.toLowerCase();
        return this.generateLanguageSpecificKeyPoints(primaryLanguage);
      }
    } catch (error) {
      logger.debug('Enhanced language detection failed in key points, using fallback:', error);
    }

    // Secondary fallback: use centralized terms detection
    const contentLower = content.toLowerCase();
    const fallbackPoints = [];

    // Check for technologies from centralized configuration
    const detectedTech = TECHNICAL_TERMS.languages.find((lang: string) =>
      contentLower.includes(lang)
    );

    if (detectedTech) {
      return this.generateLanguageSpecificKeyPoints(detectedTech);
    }

    // Generic fallback
    fallbackPoints.push(
      'Core concepts and fundamentals',
      'Practical implementation examples',
      'Best practices and conventions',
      'Common patterns and solutions',
      'Advanced techniques and optimization'
    );

    return fallbackPoints.slice(0, 5);
  }

  /**
   * Generate language-specific key points
   */
  private generateLanguageSpecificKeyPoints(language: string): string[] {
    const keyPointsMap: { [key: string]: string[] } = {
      react: [
        'Understanding React component architecture',
        'Implementing state management patterns',
        'Optimizing component performance',
        'Managing component lifecycle',
        'Best practices for React development',
      ],
      typescript: [
        'TypeScript type system fundamentals',
        'Advanced type definitions and interfaces',
        'Error handling and type safety',
        'Integration with existing JavaScript projects',
        'Performance optimization techniques',
      ],
      javascript: [
        'Modern JavaScript language features',
        'Asynchronous programming patterns',
        'DOM manipulation and event handling',
        'Module system and code organization',
        'Testing and debugging strategies',
      ],
      python: [
        'Python syntax and language fundamentals',
        'Object-oriented programming concepts',
        'Data structures and algorithms',
        'Library and framework integration',
        'Testing and debugging methodologies',
      ],
      java: [
        'Java programming fundamentals',
        'Object-oriented design principles',
        'Exception handling and error management',
        'Memory management and performance',
        'Enterprise development patterns',
      ],
    };

    return (
      keyPointsMap[language.toLowerCase()] || [
        `${language} programming fundamentals`,
        `${language} best practices and conventions`,
        `${language} development patterns`,
        `${language} optimization techniques`,
        `${language} testing and debugging`,
      ]
    );
  }

  /**
   * Extract tags from content using enhanced NLP
   */
  private extractTags(content: string): string[] {
    try {
      // Use compromise.js for better entity and concept extraction
      const doc = compromise(content);

      // Use enhanced topic extraction
      const enhancedTopics = enhancedTextAnalyzer.extractTopics(content, 10);
      const topicTerms = enhancedTopics.map(t => t.topic);

      // Combine with traditional approach for backup
      const nouns = doc.nouns().out('array');
      const topics = doc.topics().out('array');
      const technologies = doc.match('#Technology').out('array');

      // Technical terms that should be prioritized
      const techTerms = detectTechnicalTerms(content);

      // Combine all sources with enhanced topics prioritized
      const allTerms = [...topicTerms, ...nouns, ...topics, ...technologies, ...techTerms];

      // Remove duplicates and filter
      return [...new Set(allTerms)].filter(term => term && term.length > 2).slice(0, 10);
    } catch (error) {
      logger.debug('Error in NLP tag extraction, falling back to simple method:', error);
      return this.extractTagsSimple(content);
    }
  }

  /**
   * Simple fallback tag extraction
   */
  private extractTagsSimple(content: string): string[] {
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3);

    const frequency: { [key: string]: number } = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .filter(([_word, count]) => count > 1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Generate actionable items (synchronous)
   */
  private getActionableItemsSync(content: string): string[] {
    const actions: string[] = [];
    const lowerContent = content.toLowerCase();

    // Pattern-based action generation
    if (lowerContent.includes('code') || lowerContent.includes('example')) {
      actions.push('Review and practice the code examples provided');
    }

    if (lowerContent.includes('install') || lowerContent.includes('setup')) {
      actions.push('Set up the required tools and dependencies');
    }

    if (lowerContent.includes('test') || lowerContent.includes('testing')) {
      actions.push('Implement tests for the discussed concepts');
    }

    if (lowerContent.includes('best practice') || lowerContent.includes('pattern')) {
      actions.push('Apply the best practices in your current projects');
    }

    if (lowerContent.includes('performance') || lowerContent.includes('optimization')) {
      actions.push('Measure and optimize performance in your applications');
    }

    // Default actions
    if (actions.length === 0) {
      actions.push(
        'Study the key concepts thoroughly',
        'Create a practical example or demo',
        'Research related topics for deeper understanding'
      );
    }

    return actions.slice(0, 6);
  }

  /**
   * Extract code examples from content using enhanced language detection
   */
  private extractCodeExamples(content: string): CodeExample[] {
    try {
      // Use enhanced code block extraction
      const enhancedCodeBlocks = enhancedLanguageProcessor.extractCodeBlocks(content);

      return enhancedCodeBlocks
        .map((block, index) => ({
          language: block.language,
          code: block.code.trim(),
          description: `${block.language} example ${index + 1} (confidence: ${Math.round(block.confidence * 100)}%)`,
          runnable: ['javascript', 'typescript', 'python', 'java', 'react'].includes(
            block.language
          ),
        }))
        .slice(0, 5);
    } catch (error) {
      logger.debug('Enhanced code extraction failed, using fallback:', error);

      // Fallback to simple extraction
      const codeBlocks = content.match(/```(\w+)?\n([\s\S]*?)```/g) || [];
      return codeBlocks
        .map((block, index) => {
          const lines = block.split('\n');
          const firstLine = lines[0];
          const language = firstLine.match(/```(\w+)/)?.[1] || 'text';
          const code = lines.slice(1, -1).join('\n');

          return {
            language,
            code: code.trim(),
            description: `Code example ${index + 1}`,
            runnable: ['javascript', 'typescript', 'python'].includes(language),
          };
        })
        .slice(0, 5);
    }
  }

  /**
   * Extract links from content
   */
  private extractLinks(content: string): RelatedLink[] {
    const links: RelatedLink[] = [];

    // Extract markdown links
    const markdownLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
    markdownLinks.forEach(link => {
      const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        links.push({
          title: match[1],
          url: match[2],
          description: `Reference: ${match[1]}`,
          relationship: 'related',
        });
      }
    });

    // Extract plain URLs
    const urlPattern = /https?:\/\/[^\s<>"]+/g;
    const urls = content.match(urlPattern) || [];
    urls.forEach((url, index) => {
      if (!links.some(link => link.url === url)) {
        links.push({
          title: `Resource ${index + 1}`,
          url,
          description: 'External resource',
          relationship: 'related',
        });
      }
    });

    return links.slice(0, 10);
  }

  /**
   * Assess content difficulty
   */
  private assessDifficulty(content: string): 'beginner' | 'intermediate' | 'advanced' {
    // Use centralized difficulty terms
    const advancedTerms = DIFFICULTY_TERMS.advanced;
    const intermediateTerms = DIFFICULTY_TERMS.intermediate;

    const lowerContent = content.toLowerCase();
    const advancedCount = advancedTerms.filter(term => lowerContent.includes(term)).length;
    const intermediateCount = intermediateTerms.filter(term => lowerContent.includes(term)).length;

    if (advancedCount >= 3) return 'advanced';
    if (intermediateCount >= 2 || advancedCount >= 1) return 'intermediate';
    return 'beginner';
  }

  /**
   * Assess content complexity
   */
  private assessComplexity(content: string): 'low' | 'medium' | 'high' {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;

    if (avgSentenceLength > 150) return 'high';
    if (avgSentenceLength > 80) return 'medium';
    return 'low';
  }

  /**
   * Extract entities using enhanced NLP
   */
  private extractEntities(content: string): string[] {
    try {
      // Use enhanced topic extraction which includes entity categorization
      const enhancedTopics = enhancedTextAnalyzer.extractTopics(content, 8);
      const entityTerms = enhancedTopics
        .filter(topic => topic.category !== 'concept') // Focus on entities, not general concepts
        .map(topic => topic.topic);

      // Fallback to compromise.js for additional entities
      const doc = compromise(content);
      const people = doc.people().out('array');
      const places = doc.places().out('array');
      const organizations = doc.organizations().out('array');

      // Combine enhanced and traditional extraction
      const allEntities = [...entityTerms, ...people, ...places, ...organizations];

      // Filter and clean entities
      const cleanEntities = allEntities
        .filter(entity => entity && entity.length > 2)
        .filter(entity => entity.length < 50)
        .map(entity => entity.trim())
        .filter(entity => !/^\d+$/.test(entity))
        .filter(entity => !entity.includes('http'));

      return [...new Set(cleanEntities)].slice(0, 8);
    } catch (error) {
      logger.debug('Error in enhanced entity extraction, falling back to simple method:', error);
      return this.extractEntitiesSimple(content);
    }
  }

  /**
   * Simple fallback entity extraction
   */
  private extractEntitiesSimple(content: string): string[] {
    // Look for capitalized words that might be entities
    const capitalizedWords = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];

    // Filter out stop words using stopword library
    const entities = capitalizedWords
      .filter(word => {
        const filtered = removeStopwords([word.toLowerCase()], eng);
        return filtered.length > 0;
      })
      .filter(word => word.length > 2);

    return [...new Set(entities)].slice(0, 8);
  }

  /**
   * Calculate reading level (simplified)
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
   * Generate summary text
   */
  private generateSummaryText(content: string): string {
    // Clean content by removing code blocks, frontmatter, and markdown syntax
    const cleanContent = content
      .replace(/^---[\s\S]*?---/m, '') // Remove frontmatter
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]*`/g, '') // Remove inline code
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // Remove emphasis
      .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Extract meaningful phrases and concepts
    const lines = cleanContent.split('\n').filter(line => line.trim().length > 5);
    const concepts = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 10 && trimmed.length < 100) {
        // Skip fragments and incomplete sentences
        if (!trimmed.includes('{') && !trimmed.includes('}') && !trimmed.includes('()')) {
          concepts.push(trimmed);
        }
      }
    }

    // Create a coherent summary from the extracted concepts
    const mainConcepts = concepts.slice(0, 3);
    const topicName = this.extractTopicName(content);

    let summaryText = `This guide provides comprehensive coverage of ${topicName}.`;

    if (mainConcepts.length > 0) {
      summaryText += ` Key areas include: ${mainConcepts.join(', ')}.`;
    }

    summaryText += ` The content covers essential concepts, practical examples, and implementation guidance for developers at various skill levels.`;

    // Count approximate words for metadata
    const wordCount = cleanContent.split(/\s+/).filter(word => word.length > 0).length;
    const keyAreas = Math.min(5, Math.max(3, Math.floor(concepts.length / 2)));

    return `${summaryText}

This comprehensive resource covers ${keyAreas} key areas across approximately ${wordCount} words. The material includes practical examples and step-by-step guidance for effective implementation.`;
  }

  private extractTopicName(content: string): string {
    // Extract title from first header
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      return titleMatch[1].trim();
    }

    try {
      // Use enhanced programming language detection for more accurate topic identification
      const detectedLanguages = enhancedLanguageProcessor.detectProgrammingLanguages(content);
      if (detectedLanguages.length > 0 && detectedLanguages[0].confidence > 0.7) {
        return `${detectedLanguages[0].language} development`;
      }

      // Use enhanced topic extraction for intelligent topic naming
      const topics = enhancedTextAnalyzer.extractTopics(content, 3);
      if (topics.length > 0) {
        const primaryTopic = topics[0];

        // Generate contextual topic name based on category
        switch (primaryTopic.category) {
          case 'technology':
            return `${primaryTopic.topic} development`;
          case 'concept':
            return `${primaryTopic.topic} concepts`;
          case 'organization':
            return `${primaryTopic.topic} guide`;
          case 'other':
            return `${primaryTopic.topic} reference`;
          default:
            return primaryTopic.topic;
        }
      }
    } catch (error) {
      logger.debug('Enhanced topic name extraction failed, using fallback:', error);
    }

    // Fallback using centralized technical terms
    const contentLower = content.toLowerCase();

    // Check languages from centralized config
    const detectedLanguage = TECHNICAL_TERMS.languages.find((lang: string) =>
      contentLower.includes(lang)
    );
    if (detectedLanguage) {
      return `${detectedLanguage} development`;
    }

    // Check core concepts
    const detectedConcept = TECHNICAL_TERMS.coreConcepts.find((concept: string) =>
      contentLower.includes(concept)
    );
    if (detectedConcept) {
      return `${detectedConcept} concepts`;
    }

    return 'software development concepts';
  } /**
   * Simulate processing delay
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
