/**
 * Enhanced NLP Utilities
 * Advanced text processing using multiple NLP libraries for better accuracy
 */

import { removeStopwords, eng } from 'stopword';
import { WordTokenizer, SentimentAnalyzer, PorterStemmer as Stemmer, TfIdf } from 'natural';
import compromise from 'compromise';
import stringSimilarity from 'string-similarity';

/**
 * Advanced Sentiment Analysis
 * Combines multiple approaches for more accurate sentiment detection
 */
export class EnhancedSentimentAnalyzer {
  private readonly sentimentAnalyzer: SentimentAnalyzer;
  private readonly tokenizer: WordTokenizer;

  constructor() {
    this.tokenizer = new WordTokenizer();
    this.sentimentAnalyzer = new SentimentAnalyzer('English', Stemmer, 'afinn');
  }

  /**
   * Analyze sentiment using multiple techniques
   */
  analyzeSentiment(text: string): {
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    score: number;
    breakdown: {
      afinn: number;
      compromise: number;
      contextual: number;
    };
  } {
    // 1. Natural.js AFINN scoring
    const tokens = this.tokenizer.tokenize(text.toLowerCase()) || [];
    const filteredTokens = removeStopwords(tokens, eng);
    const afinnScore = this.sentimentAnalyzer.getSentiment(filteredTokens);

    // 2. Compromise.js sentiment analysis
    const doc = compromise(text);
    const compromiseScore = this.getCompromiseScore(doc);

    // 3. Contextual analysis (technical content considerations)
    const contextualScore = this.analyzeContextualSentiment(text, doc);

    // 4. Weighted combination
    const finalScore = afinnScore * 0.4 + compromiseScore * 0.3 + contextualScore * 0.3;

    // 5. Determine sentiment with confidence
    const { sentiment, confidence } = this.calculateSentimentWithConfidence(
      finalScore,
      afinnScore,
      compromiseScore,
      contextualScore
    );

    return {
      sentiment,
      confidence,
      score: finalScore,
      breakdown: {
        afinn: afinnScore,
        compromise: compromiseScore,
        contextual: contextualScore,
      },
    };
  }

  /**
   * Get sentiment from Compromise.js analysis
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getCompromiseScore(doc: any): number {
    // Compromise can identify positive/negative words more contextually
    const sentences = doc.sentences();
    let totalScore = 0;
    let sentenceCount = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sentences.forEach((sentence: any) => {
      sentenceCount++;

      // Check for positive indicators
      if (
        sentence.has('#Positive') ||
        sentence.has('good|great|excellent|amazing|perfect|best|love|like')
      ) {
        totalScore += 0.5;
      }

      // Check for negative indicators
      if (
        sentence.has('#Negative') ||
        sentence.has('bad|terrible|awful|hate|dislike|worst|problem|issue|error')
      ) {
        totalScore -= 0.5;
      }

      // Check for intensifiers
      if (sentence.has('very|extremely|really|absolutely')) {
        const lastScore = totalScore;
        totalScore = lastScore * 1.5; // Amplify the sentiment
      }

      // Check for negations
      if (sentence.has('not|never|no|none|neither')) {
        totalScore = -totalScore; // Flip sentiment
      }
    });

    return sentenceCount > 0 ? totalScore / sentenceCount : 0;
  }

  /**
   * Analyze contextual sentiment for technical content
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private analyzeContextualSentiment(text: string, doc: any): number {
    let contextScore = 0;

    // Technical content often has neutral-to-positive sentiment even when discussing "problems"
    const technicalTerms = doc.match(
      '(api|database|framework|algorithm|code|function|method|class)'
    ).length;
    if (technicalTerms > 0) {
      contextScore += 0.1; // Slight positive bias for technical content
    }

    // Educational content indicators
    const educationalTerms = doc.match('(learn|tutorial|guide|example|how to|step by step)').length;
    if (educationalTerms > 0) {
      contextScore += 0.2; // Educational content is generally positive
    }

    // Problem-solving context (neutral, not negative)
    const problemSolvingTerms = doc.match('(solution|solve|fix|resolve|answer|help)').length;
    if (problemSolvingTerms > 0) {
      contextScore += 0.1; // Problem-solving is constructive
    }

    // Documentation/formal content (neutral)
    const formalTerms = doc.match(
      '(documentation|specification|requirements|implementation)'
    ).length;
    if (formalTerms > 0) {
      contextScore += 0.05; // Formal content tends to be neutral-positive
    }

    return Math.min(contextScore, 1.0); // Cap at 1.0
  }

  /**
   * Calculate final sentiment with confidence score
   */
  private calculateSentimentWithConfidence(
    finalScore: number,
    afinnScore: number,
    compromiseScore: number,
    contextualScore: number
  ): { sentiment: 'positive' | 'neutral' | 'negative'; confidence: number } {
    // Determine sentiment
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (finalScore > 0.15) sentiment = 'positive';
    else if (finalScore < -0.15) sentiment = 'negative';

    // Calculate confidence based on agreement between methods
    const scores = [afinnScore, compromiseScore, contextualScore];
    const nonZeroScores = scores.filter(s => Math.abs(s) > 0.05);

    if (nonZeroScores.length === 0) {
      return { sentiment: 'neutral', confidence: 0.8 };
    }

    // Check agreement
    const positiveCount = nonZeroScores.filter(s => s > 0).length;
    const negativeCount = nonZeroScores.filter(s => s < 0).length;
    const agreement = Math.max(positiveCount, negativeCount) / nonZeroScores.length;

    // Higher agreement = higher confidence
    const confidence = Math.min(0.5 + agreement * 0.5 + Math.abs(finalScore) * 0.3, 1.0);

    return { sentiment, confidence };
  }
}

/**
 * Enhanced Text Analysis
 * Better topic extraction, entity recognition, and text similarity
 */
export class EnhancedTextAnalyzer {
  private readonly tfidf: TfIdf;
  private readonly tokenizer: WordTokenizer;

  constructor() {
    this.tfidf = new TfIdf();
    this.tokenizer = new WordTokenizer();
  }

  /**
   * Extract key topics using multiple NLP techniques
   */
  extractTopics(
    text: string,
    maxTopics: number = 5
  ): Array<{
    topic: string;
    relevance: number;
    category: 'person' | 'place' | 'organization' | 'technology' | 'concept' | 'other';
  }> {
    const doc = compromise(text);
    const topics: Array<{
      topic: string;
      relevance: number;
      category: 'person' | 'place' | 'organization' | 'technology' | 'concept' | 'other';
    }> = [];

    // 1. Extract named entities with categories
    const people = doc.people().out('array') as string[];
    const places = doc.places().out('array') as string[];
    const organizations = doc.organizations().out('array') as string[];

    // Add named entities
    people.forEach(person => topics.push({ topic: person, relevance: 0.8, category: 'person' }));
    places.forEach(place => topics.push({ topic: place, relevance: 0.7, category: 'place' }));
    organizations.forEach(org =>
      topics.push({ topic: org, relevance: 0.8, category: 'organization' })
    );

    // 2. Extract technical terms
    const techTerms = doc
      .match(
        '(#Technology|#Programming|api|database|framework|algorithm|javascript|typescript|python|java|react|node)'
      )
      .out('array') as string[];
    techTerms.forEach(term => topics.push({ topic: term, relevance: 0.9, category: 'technology' }));

    // 3. Extract important nouns and concepts
    const nouns = doc.nouns().out('array') as string[];
    const filteredNouns = removeStopwords(
      nouns.map(n => n.toLowerCase()),
      eng
    )
      .filter(noun => noun.length > 2)
      .slice(0, 10);

    // Use TF-IDF for noun relevance
    this.tfidf.addDocument(filteredNouns);
    filteredNouns.forEach(noun => {
      const tfidfScore = this.tfidf.tfidf(noun, 0);
      if (tfidfScore > 0.1) {
        topics.push({ topic: noun, relevance: tfidfScore, category: 'concept' });
      }
    });

    // 4. Remove duplicates and sort by relevance
    const uniqueTopics = new Map();
    topics.forEach(({ topic, relevance, category }) => {
      const key = topic.toLowerCase();
      if (!uniqueTopics.has(key) || uniqueTopics.get(key).relevance < relevance) {
        uniqueTopics.set(key, { topic, relevance, category });
      }
    });

    return Array.from(uniqueTopics.values())
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxTopics);
  }

  /**
   * Enhanced text similarity using multiple algorithms
   */
  calculateSimilarity(
    text1: string,
    text2: string
  ): {
    similarity: number;
    method: 'exact' | 'structural' | 'semantic' | 'hybrid';
    confidence: number;
  } {
    // 1. Basic string similarity
    const basicSim = stringSimilarity.compareTwoStrings(text1.toLowerCase(), text2.toLowerCase());

    // 2. Structural similarity (compromise-based)
    const doc1 = compromise(text1);
    const doc2 = compromise(text2);

    const topics1 = doc1.topics().out('array');
    const topics2 = doc2.topics().out('array');
    const structuralSim = this.calculateArraySimilarity(topics1, topics2);

    // 3. Semantic similarity (TF-IDF based)
    const tokens1 = removeStopwords(this.tokenizer.tokenize(text1.toLowerCase()) || [], eng);
    const tokens2 = removeStopwords(this.tokenizer.tokenize(text2.toLowerCase()) || [], eng);

    this.tfidf.addDocument(tokens1);
    this.tfidf.addDocument(tokens2);

    const semanticSim = this.calculateTfIdfSimilarity(tokens1, tokens2);

    // 4. Weighted combination
    const hybridSim = basicSim * 0.3 + structuralSim * 0.4 + semanticSim * 0.3;

    // Determine best method and confidence
    const scores = [
      { similarity: basicSim, method: 'exact' as const },
      { similarity: structuralSim, method: 'structural' as const },
      { similarity: semanticSim, method: 'semantic' as const },
      { similarity: hybridSim, method: 'hybrid' as const },
    ];

    const best = scores.reduce((a, b) => (a.similarity > b.similarity ? a : b));
    const confidence = Math.min(best.similarity + 0.2, 1.0);

    return {
      similarity: best.similarity,
      method: best.method,
      confidence,
    };
  }

  /**
   * Calculate similarity between arrays of strings
   */
  private calculateArraySimilarity(arr1: string[], arr2: string[]): number {
    if (arr1.length === 0 && arr2.length === 0) return 1.0;
    if (arr1.length === 0 || arr2.length === 0) return 0.0;

    const set1 = new Set(arr1.map(s => s.toLowerCase()));
    const set2 = new Set(arr2.map(s => s.toLowerCase()));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Calculate TF-IDF based similarity
   */
  private calculateTfIdfSimilarity(tokens1: string[], tokens2: string[]): number {
    const allTokens = [...new Set([...tokens1, ...tokens2])];
    let similarity = 0;

    allTokens.forEach(token => {
      const score1 = this.tfidf.tfidf(token, 0) || 0;
      const score2 = this.tfidf.tfidf(token, 1) || 0;
      similarity += Math.min(score1, score2);
    });

    return Math.min(similarity, 1.0);
  }
}

/**
 * Enhanced Language Detection and Processing
 */
export class EnhancedLanguageProcessor {
  /**
   * Detect programming languages in text
   */
  detectProgrammingLanguages(text: string): Array<{
    language: string;
    confidence: number;
    evidence: string[];
  }> {
    const results: Array<{ language: string; confidence: number; evidence: string[] }> = [];

    // Language-specific patterns
    const languagePatterns = {
      javascript: {
        keywords: ['function', 'var', 'let', 'const', 'async', 'await', 'promise'],
        patterns: [/\bfunction\s+\w+\s*\(/gi, /\b(let|const|var)\s+\w+/gi, /=>\s*/gi],
        extensions: ['.js', '.mjs', '.jsx'],
      },
      typescript: {
        keywords: ['interface', 'type', 'enum', 'namespace', 'declare'],
        patterns: [/:\s*\w+(\[\]|\||&)/gi, /interface\s+\w+/gi, /type\s+\w+\s*=/gi],
        extensions: ['.ts', '.tsx', '.d.ts'],
      },
      python: {
        keywords: ['def', 'class', 'import', 'from', 'if __name__', 'self'],
        patterns: [/def\s+\w+\s*\(/gi, /class\s+\w+\s*\(/gi, /import\s+\w+/gi],
        extensions: ['.py', '.pyx', '.pyw'],
      },
      java: {
        keywords: ['public', 'private', 'protected', 'class', 'interface', 'extends'],
        patterns: [/public\s+(static\s+)?void\s+main/gi, /class\s+\w+\s*\{/gi],
        extensions: ['.java'],
      },
      react: {
        keywords: ['jsx', 'component', 'props', 'state', 'hook', 'usestate'],
        patterns: [/<\w+\s*\/?>|<\/\w+>/gi, /use\w+\s*\(/gi, /\w+\.map\s*\(/gi],
        extensions: ['.jsx', '.tsx'],
      },
    };

    Object.entries(languagePatterns).forEach(([lang, config]) => {
      const evidence: string[] = [];
      let score = 0;

      // Check keywords
      config.keywords.forEach(keyword => {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          score += 0.2;
          evidence.push(`keyword: ${keyword}`);
        }
      });

      // Check patterns
      config.patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
          score += 0.3 * Math.min(matches.length, 3); // Cap the bonus
          evidence.push(`pattern match: ${matches.length} occurrences`);
        }
      });

      // Check file extensions
      config.extensions.forEach(ext => {
        if (text.includes(ext)) {
          score += 0.1;
          evidence.push(`extension: ${ext}`);
        }
      });

      if (score > 0.1) {
        results.push({
          language: lang,
          confidence: Math.min(score, 1.0),
          evidence,
        });
      }
    });

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Extract code blocks with better language detection
   */
  extractCodeBlocks(text: string): Array<{
    code: string;
    language: string;
    confidence: number;
    startLine?: number;
    endLine?: number;
  }> {
    const codeBlocks: Array<{
      code: string;
      language: string;
      confidence: number;
      startLine?: number;
      endLine?: number;
    }> = [];

    // Markdown code blocks
    const markdownBlocks = text.match(/```(\w+)?\n([\s\S]*?)```/g) || [];
    markdownBlocks.forEach(block => {
      const match = block.match(/```(\w+)?\n([\s\S]*?)```/);
      if (match) {
        const declaredLang = match[1] || 'unknown';
        const code = match[2];
        const detectedLangs = this.detectProgrammingLanguages(code);

        const language = detectedLangs.length > 0 ? detectedLangs[0].language : declaredLang;
        const confidence = detectedLangs.length > 0 ? detectedLangs[0].confidence : 0.5;

        codeBlocks.push({ code, language, confidence });
      }
    });

    // Inline code detection (basic)
    const inlineCode = text.match(/`([^`]+)`/g) || [];
    inlineCode.forEach(code => {
      const cleanCode = code.replace(/`/g, '');
      if (cleanCode.length > 10) {
        // Only analyze substantial inline code
        const detectedLangs = this.detectProgrammingLanguages(cleanCode);
        if (detectedLangs.length > 0) {
          codeBlocks.push({
            code: cleanCode,
            language: detectedLangs[0].language,
            confidence: detectedLangs[0].confidence * 0.7, // Lower confidence for inline
          });
        }
      }
    });

    return codeBlocks;
  }
}

// Export singleton instances for easy use
export const enhancedSentiment = new EnhancedSentimentAnalyzer();
export const enhancedTextAnalyzer = new EnhancedTextAnalyzer();
export const enhancedLanguageProcessor = new EnhancedLanguageProcessor();
