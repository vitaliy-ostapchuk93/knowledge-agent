/**
 * Knowledge Linking Engine
 * Automatically detects relationships between content and creates bidirectional links
 * Enhanced with professional NLP libraries for superior semantic understanding
 */

import { DiscoveredContent } from '@/types/index.ts';
import { logger } from '@/utils/logger.ts';
import { WordTokenizer, SentimentAnalyzer, PorterStemmer as Stemmer, TfIdf } from 'natural';
import { compareTwoStrings } from 'string-similarity';
import { removeStopwords, eng } from 'stopword';
import compromise from 'compromise';
import { stemmer } from 'stemmer';
import { TECHNICAL_TERMS } from '@/utils/terms-config.ts';

export interface KnowledgeLink {
  sourceId: string;
  targetId: string;
  linkType: 'similar' | 'related' | 'dependency' | 'hierarchy' | 'temporal';
  strength: number; // 0.0 to 1.0
  reason: string;
  bidirectional: boolean;
}

export interface LinkingOptions {
  minLinkStrength?: number;
  maxLinksPerContent?: number;
  enableBidirectional?: boolean;
  linkTypes?: KnowledgeLink['linkType'][];
}

export interface KnowledgeGraph {
  nodes: Map<string, DiscoveredContent>;
  links: KnowledgeLink[];
  clusters: string[][];
}

export class KnowledgeLinkingEngine {
  private knowledgeGraph: KnowledgeGraph = {
    nodes: new Map(),
    links: [],
    clusters: [],
  };

  // Enhanced NLP components for superior semantic understanding
  private readonly tokenizer: WordTokenizer;
  private readonly tfidf: TfIdf;
  private readonly sentimentAnalyzer: SentimentAnalyzer;

  constructor() {
    this.tokenizer = new WordTokenizer();
    this.tfidf = new TfIdf();
    this.sentimentAnalyzer = new SentimentAnalyzer('English', Stemmer, 'afinn');
    logger.debug('🔗 Knowledge Linking Engine initialized with enhanced NLP capabilities');
  }

  /**
   * Add content to the knowledge graph and detect links
   */
  async addContent(
    content: DiscoveredContent,
    options: LinkingOptions = {}
  ): Promise<KnowledgeLink[]> {
    logger.debug(`🔗 Adding content to knowledge graph: "${content.title}"`);

    // Add to graph
    this.knowledgeGraph.nodes.set(content.id, content);

    // Detect links with existing content
    const newLinks = await this.detectLinks(content, options);

    // Add links to graph
    this.knowledgeGraph.links.push(...newLinks);

    logger.debug(`🔗 Found ${newLinks.length} new links for "${content.title}"`);
    return newLinks;
  }

  /**
   * Detect links between new content and existing content
   */
  private async detectLinks(
    newContent: DiscoveredContent,
    options: LinkingOptions = {}
  ): Promise<KnowledgeLink[]> {
    const links: KnowledgeLink[] = [];
    const minStrength = options.minLinkStrength ?? 0.3;
    const maxLinks = options.maxLinksPerContent ?? 10;
    const enableBidirectional = options.enableBidirectional ?? true;

    for (const [existingId, existingContent] of this.knowledgeGraph.nodes) {
      if (existingId === newContent.id) continue;

      // Check different types of relationships
      const similarityLinks = this.detectSimilarityLinks(newContent, existingContent);
      const dependencyLinks = this.detectDependencyLinks(newContent, existingContent);
      const hierarchyLinks = this.detectHierarchyLinks(newContent, existingContent);
      const temporalLinks = this.detectTemporalLinks(newContent, existingContent);

      const allDetectedLinks = [
        ...similarityLinks,
        ...dependencyLinks,
        ...hierarchyLinks,
        ...temporalLinks,
      ];

      // Filter by strength and options
      const validLinks = allDetectedLinks
        .filter(link => link.strength >= minStrength)
        .filter(link => !options.linkTypes || options.linkTypes.includes(link.linkType));

      links.push(...validLinks);

      // Create bidirectional links if enabled
      if (enableBidirectional) {
        validLinks.forEach(link => {
          if (link.bidirectional) {
            links.push({
              sourceId: link.targetId,
              targetId: link.sourceId,
              linkType: link.linkType,
              strength: link.strength,
              reason: `Bidirectional: ${link.reason}`,
              bidirectional: true,
            });
          }
        });
      }
    }

    // Sort by strength and limit
    return links.sort((a, b) => b.strength - a.strength).slice(0, maxLinks);
  }

  /**
   * Detect similarity-based links (shared topics, tags, content)
   */
  private detectSimilarityLinks(
    content1: DiscoveredContent,
    content2: DiscoveredContent
  ): KnowledgeLink[] {
    const links: KnowledgeLink[] = [];

    // Tag overlap analysis
    const tagOverlap = this.calculateTagOverlap(content1.tags, content2.tags);
    if (tagOverlap.score > 0.3) {
      links.push({
        sourceId: content1.id,
        targetId: content2.id,
        linkType: 'similar',
        strength: tagOverlap.score,
        reason: `Shared topics: ${tagOverlap.commonTags.join(', ')}`,
        bidirectional: true,
      });
    }

    // Content similarity analysis
    const contentSimilarity = this.calculateContentSimilarity(content1.content, content2.content);
    if (contentSimilarity.score > 0.4) {
      links.push({
        sourceId: content1.id,
        targetId: content2.id,
        linkType: 'similar',
        strength: contentSimilarity.score,
        reason: `Similar content: ${contentSimilarity.commonConcepts.join(', ')}`,
        bidirectional: true,
      });
    }

    // Source similarity
    if (content1.source === content2.source && content1.source !== 'web') {
      links.push({
        sourceId: content1.id,
        targetId: content2.id,
        linkType: 'related',
        strength: 0.5,
        reason: `Same source: ${content1.source}`,
        bidirectional: true,
      });
    }

    return links;
  }

  /**
   * Detect dependency relationships (A depends on B, B is prerequisite for A)
   */
  private detectDependencyLinks(
    content1: DiscoveredContent,
    content2: DiscoveredContent
  ): KnowledgeLink[] {
    const links: KnowledgeLink[] = [];

    // Technology stack dependencies
    const techDependencies = this.detectTechStackDependencies(content1, content2);
    links.push(...techDependencies);

    // Learning dependencies (beginner -> advanced)
    const learningDependency = this.detectLearningDependency(content1, content2);
    if (learningDependency) {
      links.push(learningDependency);
    }

    return links;
  }

  /**
   * Detect hierarchical relationships (parent-child, category-subcategory)
   */
  private detectHierarchyLinks(
    content1: DiscoveredContent,
    content2: DiscoveredContent
  ): KnowledgeLink[] {
    const links: KnowledgeLink[] = [];

    // Framework -> Library hierarchy
    const frameworkHierarchy = this.detectFrameworkHierarchy(content1, content2);
    if (frameworkHierarchy) {
      links.push(frameworkHierarchy);
    }

    // Topic -> Subtopic hierarchy
    const topicHierarchy = this.detectTopicHierarchy(content1, content2);
    if (topicHierarchy) {
      links.push(topicHierarchy);
    }

    return links;
  }

  /**
   * Detect temporal relationships (A comes before B, A is newer than B)
   */
  private detectTemporalLinks(
    content1: DiscoveredContent,
    content2: DiscoveredContent
  ): KnowledgeLink[] {
    const links: KnowledgeLink[] = [];

    // Version relationships (React 17 -> React 18)
    const versionLink = this.detectVersionRelationship(content1, content2);
    if (versionLink) {
      links.push(versionLink);
    }

    return links;
  }

  /**
   * Calculate tag overlap between two content items
   */
  private calculateTagOverlap(
    tags1: string[],
    tags2: string[]
  ): {
    score: number;
    commonTags: string[];
  } {
    const set1 = new Set(tags1.map(tag => tag.toLowerCase()));
    const set2 = new Set(tags2.map(tag => tag.toLowerCase()));

    const intersection = new Set([...set1].filter(tag => set2.has(tag)));
    const union = new Set([...set1, ...set2]);

    const score = intersection.size / union.size;

    return {
      score,
      commonTags: Array.from(intersection),
    };
  }

  /**
   * Calculate content similarity using enhanced NLP analysis
   */
  private calculateContentSimilarity(
    content1: string,
    content2: string
  ): {
    score: number;
    commonConcepts: string[];
  } {
    try {
      // Enhanced semantic similarity using string-similarity
      const semanticScore = compareTwoStrings(content1.toLowerCase(), content2.toLowerCase());

      // Extract keywords using enhanced NLP
      const keywords1 = this.extractKeywordsWithNLP(content1);
      const keywords2 = this.extractKeywordsWithNLP(content2);

      // Calculate keyword overlap
      const keywordOverlap = this.calculateTagOverlap(keywords1, keywords2);

      // Use TF-IDF for document similarity
      const tfidfScore = this.calculateTfIdfSimilarity(content1, content2);

      // Extract entities and concepts using compromise.js
      const concepts1 = this.extractConceptsWithNLP(content1);
      const concepts2 = this.extractConceptsWithNLP(content2);
      const conceptOverlap = this.calculateTagOverlap(concepts1, concepts2);

      // Combine scores with weights
      const combinedScore =
        semanticScore * 0.3 +
        keywordOverlap.score * 0.3 +
        tfidfScore * 0.2 +
        conceptOverlap.score * 0.2;

      // Combine common elements
      const allCommonConcepts = [...keywordOverlap.commonTags, ...conceptOverlap.commonTags].filter(
        (item, index, array) => array.indexOf(item) === index
      );

      return {
        score: Math.min(1, combinedScore),
        commonConcepts: allCommonConcepts.slice(0, 5), // Limit for readability
      };
    } catch (error) {
      logger.debug('Enhanced content similarity calculation failed, using fallback:', error);
      return this.calculateBasicContentSimilarity(content1, content2);
    }
  }

  /**
   * Enhanced keyword extraction using NLP libraries
   */
  private extractKeywordsWithNLP(content: string): string[] {
    try {
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

      // Use compromise.js for better concept extraction
      const doc = compromise(content);
      const nouns = doc.nouns().out('array');
      const topics = doc.topics().out('array');

      // Combine frequency-based and NLP-extracted terms
      const nlpTerms = [...nouns, ...topics]
        .map(term => term.toLowerCase())
        .filter(term => term.length > 2);

      // Technical terms that should be prioritized
      const techTerms = this.getTechnicalTerms();

      // Score and rank all terms
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
            .slice(0, 10)
            .map(item => item.term)
        ),
      ].filter(term => term.length > 2);
    } catch (error) {
      logger.debug('Enhanced keyword extraction failed, using basic method:', error);
      return this.extractKeywords(content);
    }
  }

  /**
   * Extract concepts and entities using compromise.js
   */
  private extractConceptsWithNLP(content: string): string[] {
    try {
      const doc = compromise(content);

      // Extract different types of concepts
      const people = doc.people().out('array');
      const places = doc.places().out('array');
      const organizations = doc.organizations().out('array');
      const topics = doc.topics().out('array');
      const nouns = doc.nouns().out('array');

      // Combine and clean concepts
      const allConcepts = [...people, ...places, ...organizations, ...topics, ...nouns];

      const cleanConcepts = allConcepts
        .filter(concept => concept && concept.length > 2)
        .filter(concept => concept.length < 50)
        .map(concept => concept.toLowerCase().trim())
        .filter(concept => !/^\d+$/.test(concept))
        .filter(concept => !concept.includes('http'));

      return [...new Set(cleanConcepts)].slice(0, 8);
    } catch (error) {
      logger.debug('Concept extraction failed:', error);
      return [];
    }
  }

  /**
   * Calculate TF-IDF based similarity between two documents
   */
  private calculateTfIdfSimilarity(content1: string, content2: string): number {
    try {
      // Clear previous documents
      this.tfidf.documents.length = 0;

      // Add documents to TF-IDF corpus
      this.tfidf.addDocument(content1);
      this.tfidf.addDocument(content2);

      // Extract meaningful terms from both documents
      const terms1 = this.extractKeywordsWithNLP(content1).slice(0, 10);
      const terms2 = this.extractKeywordsWithNLP(content2).slice(0, 10);
      const allTerms = [...new Set([...terms1, ...terms2])];

      if (allTerms.length === 0) return 0;

      // Calculate TF-IDF vectors
      const vector1: number[] = [];
      const vector2: number[] = [];

      allTerms.forEach(term => {
        vector1.push(this.tfidf.tfidf(term, 0));
        vector2.push(this.tfidf.tfidf(term, 1));
      });

      // Calculate cosine similarity
      const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
      const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
      const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));

      if (magnitude1 === 0 || magnitude2 === 0) return 0;

      return dotProduct / (magnitude1 * magnitude2);
    } catch (error) {
      logger.debug('TF-IDF similarity calculation failed:', error);
      return 0;
    }
  }

  /**
   * Get list of technical terms for prioritization
   */
  private getTechnicalTerms(): string[] {
    return [
      // Programming languages
      'javascript',
      'typescript',
      'python',
      'java',
      'react',
      'vue',
      'angular',
      'nodejs',
      'express',
      'fastify',
      'nestjs',
      'graphql',
      'rest',
      'api',

      // Development concepts
      'component',
      'function',
      'class',
      'interface',
      'pattern',
      'design',
      'algorithm',
      'performance',
      'security',
      'testing',
      'deployment',
      'framework',
      'library',
      'service',
      'authentication',
      'authorization',
      'middleware',
      'routing',
      'optimization',
      'caching',
      'database',

      // Architecture terms
      'microservices',
      'monolith',
      'serverless',
      'container',
      'docker',
      'kubernetes',
      'devops',
      'cicd',
      'architecture',
      'scalability',
      'distributed',
      'concurrent',
      'asynchronous',
      'synchronous',
    ];
  }

  /**
   * Basic content similarity fallback
   */
  private calculateBasicContentSimilarity(
    content1: string,
    content2: string
  ): {
    score: number;
    commonConcepts: string[];
  } {
    // Extract keywords from both contents
    const keywords1 = this.extractKeywords(content1);
    const keywords2 = this.extractKeywords(content2);

    const overlap = this.calculateTagOverlap(keywords1, keywords2);

    return {
      score: overlap.score,
      commonConcepts: overlap.commonTags,
    };
  }

  /**
   * Extract keywords from content text
   */
  private extractKeywords(content: string): string[] {
    // Technical terms pattern
    const techTerms = content.match(/\b[A-Z][a-zA-Z]{3,}\b/g) || [];

    // Common programming concepts
    const commonConcepts = [
      'api',
      'database',
      'component',
      'function',
      'class',
      'method',
      'interface',
      'framework',
      'library',
      'service',
      'module',
      'package',
      'dependency',
      'authentication',
      'authorization',
      'middleware',
      'routing',
      'testing',
      'deployment',
      'performance',
      'security',
      'optimization',
      'caching',
    ];

    const foundConcepts = commonConcepts.filter(concept => content.toLowerCase().includes(concept));

    return [...techTerms, ...foundConcepts]
      .filter((term, index, array) => array.indexOf(term) === index)
      .slice(0, 10); // Limit to top 10 keywords
  }

  /**
   * Detect technology stack dependencies
   */
  private detectTechStackDependencies(
    content1: DiscoveredContent,
    content2: DiscoveredContent
  ): KnowledgeLink[] {
    const dependencies = [
      // Frontend dependencies
      { from: 'react', to: 'javascript', strength: 0.8 },
      { from: 'vue', to: 'javascript', strength: 0.8 },
      { from: 'angular', to: 'typescript', strength: 0.9 },
      { from: 'nextjs', to: 'react', strength: 0.9 },
      { from: 'nuxt', to: 'vue', strength: 0.9 },

      // Backend dependencies
      { from: 'express', to: 'nodejs', strength: 0.9 },
      { from: 'nestjs', to: 'nodejs', strength: 0.8 },
      { from: 'fastify', to: 'nodejs', strength: 0.8 },

      // Database dependencies
      { from: 'mongoose', to: 'mongodb', strength: 0.9 },
      { from: 'prisma', to: 'database', strength: 0.7 },
      { from: 'typeorm', to: 'database', strength: 0.7 },
    ];

    const links: KnowledgeLink[] = [];

    for (const dep of dependencies) {
      const content1HasFrom = this.contentMentions(content1, dep.from);
      const content2HasTo = this.contentMentions(content2, dep.to);
      const content1HasTo = this.contentMentions(content1, dep.to);
      const content2HasFrom = this.contentMentions(content2, dep.from);

      if (content1HasFrom && content2HasTo) {
        links.push({
          sourceId: content1.id,
          targetId: content2.id,
          linkType: 'dependency',
          strength: dep.strength,
          reason: `${dep.from} depends on ${dep.to}`,
          bidirectional: false,
        });
      }

      if (content2HasFrom && content1HasTo) {
        links.push({
          sourceId: content2.id,
          targetId: content1.id,
          linkType: 'dependency',
          strength: dep.strength,
          reason: `${dep.from} depends on ${dep.to}`,
          bidirectional: false,
        });
      }
    }

    return links;
  }

  /**
   * Enhanced check if content mentions a specific technology/concept using semantic matching
   */
  private contentMentions(content: DiscoveredContent, term: string): boolean {
    const searchText =
      `${content.title} ${content.content} ${content.tags.join(' ')}`.toLowerCase();

    // Basic exact match
    if (searchText.includes(term.toLowerCase())) {
      return true;
    }

    try {
      // Enhanced semantic checking
      // Check stemmed versions
      const stemmedTerm = stemmer(term.toLowerCase());
      const tokens = this.tokenizer.tokenize(searchText) || [];
      const stemmedTokens = tokens.map(token => stemmer(token));

      if (stemmedTokens.includes(stemmedTerm)) {
        return true;
      }

      // Check semantic similarity with key concepts
      const concepts = this.extractConceptsWithNLP(searchText);
      const semanticMatches = concepts.filter(
        concept => compareTwoStrings(concept, term.toLowerCase()) > 0.7
      );

      return semanticMatches.length > 0;
    } catch (error) {
      logger.debug('Semantic content mention check failed, using basic match:', error);
      return searchText.includes(term.toLowerCase());
    }
  }

  /**
   * Detect learning progression dependencies
   */
  private detectLearningDependency(
    content1: DiscoveredContent,
    content2: DiscoveredContent
  ): KnowledgeLink | null {
    const beginnerTerms = ['beginner', 'basics', 'introduction', 'getting started', 'fundamentals'];
    const advancedTerms = ['advanced', 'expert', 'deep dive', 'best practices', 'optimization'];

    const content1Beginner = beginnerTerms.some(term => this.contentMentions(content1, term));
    const content2Advanced = advancedTerms.some(term => this.contentMentions(content2, term));

    if (content1Beginner && content2Advanced) {
      return {
        sourceId: content1.id,
        targetId: content2.id,
        linkType: 'dependency',
        strength: 0.6,
        reason: 'Learning progression: beginner → advanced',
        bidirectional: false,
      };
    }

    return null;
  }

  /**
   * Detect framework-library hierarchy
   */
  private detectFrameworkHierarchy(
    content1: DiscoveredContent,
    content2: DiscoveredContent
  ): KnowledgeLink | null {
    const hierarchies = [
      { parent: 'react', child: 'redux' },
      { parent: 'react', child: 'react router' },
      { parent: 'vue', child: 'vuex' },
      { parent: 'angular', child: 'rxjs' },
      { parent: 'nodejs', child: 'express' },
    ];

    for (const hierarchy of hierarchies) {
      const content1Parent = this.contentMentions(content1, hierarchy.parent);
      const content2Child = this.contentMentions(content2, hierarchy.child);

      if (content1Parent && content2Child) {
        return {
          sourceId: content1.id,
          targetId: content2.id,
          linkType: 'hierarchy',
          strength: 0.7,
          reason: `${hierarchy.child} is part of ${hierarchy.parent} ecosystem`,
          bidirectional: false,
        };
      }
    }

    return null;
  }

  /**
   * Detect topic-subtopic hierarchy using centralized technical terms
   */
  private detectTopicHierarchy(
    content1: DiscoveredContent,
    content2: DiscoveredContent
  ): KnowledgeLink | null {
    const title1 = content1.title.toLowerCase();
    const title2 = content2.title.toLowerCase();

    // Define hierarchical relationships between technologies
    const hierarchies = [
      { parent: 'javascript', children: ['typescript', 'node', 'react', 'vue', 'angular'] },
      { parent: 'web', children: ['html', 'css', 'javascript', 'react', 'vue', 'angular'] },
      { parent: 'frontend', children: ['react', 'vue', 'angular', 'svelte'] },
      { parent: 'backend', children: ['node', 'express', 'django', 'flask', 'spring'] },
      { parent: 'python', children: ['django', 'flask', 'fastapi'] },
      { parent: 'java', children: ['spring', 'hibernate', 'maven', 'gradle'] },
      { parent: 'database', children: ['sql', 'mysql', 'postgresql', 'mongodb', 'redis'] },
    ];

    // Check for parent-child relationships
    for (const hierarchy of hierarchies) {
      const parentInTitle1 = title1.includes(hierarchy.parent);
      const parentInTitle2 = title2.includes(hierarchy.parent);

      for (const child of hierarchy.children) {
        const childInTitle1 = title1.includes(child);
        const childInTitle2 = title2.includes(child);

        if ((parentInTitle1 && childInTitle2) || (parentInTitle2 && childInTitle1)) {
          return {
            sourceId: parentInTitle1 ? content1.id : content2.id,
            targetId: parentInTitle1 ? content2.id : content1.id,
            linkType: 'hierarchy',
            strength: 0.7,
            reason: `${child} is part of ${hierarchy.parent} ecosystem`,
            bidirectional: false,
          };
        }
      }
    }

    // Fallback to simple language relationship detection using centralized terms
    const languages = TECHNICAL_TERMS.languages;
    const lang1 = languages.find(lang => title1.includes(lang));
    const lang2 = languages.find(lang => title2.includes(lang));

    if (lang1 && lang2 && lang1 !== lang2) {
      // Special case: TypeScript extends JavaScript
      if (
        (lang1 === 'javascript' && lang2 === 'typescript') ||
        (lang1 === 'typescript' && lang2 === 'javascript')
      ) {
        return {
          sourceId: lang1 === 'javascript' ? content1.id : content2.id,
          targetId: lang1 === 'javascript' ? content2.id : content1.id,
          linkType: 'hierarchy',
          strength: 0.8,
          reason: 'TypeScript extends JavaScript',
          bidirectional: false,
        };
      }
    }

    return null;
  }

  /**
   * Detect version relationships
   */
  private detectVersionRelationship(
    content1: DiscoveredContent,
    content2: DiscoveredContent
  ): KnowledgeLink | null {
    // Look for version numbers in titles/content
    const versionPattern = /v?(\d+)\.(\d+)/g;

    const content1Versions = Array.from(content1.title.matchAll(versionPattern));
    const content2Versions = Array.from(content2.title.matchAll(versionPattern));

    if (content1Versions.length > 0 && content2Versions.length > 0) {
      // Simple version comparison - could be more sophisticated
      return {
        sourceId: content1.id,
        targetId: content2.id,
        linkType: 'temporal',
        strength: 0.5,
        reason: 'Version relationship detected',
        bidirectional: false,
      };
    }

    return null;
  }

  /**
   * Get all links for a specific content item
   */
  getLinksForContent(contentId: string): KnowledgeLink[] {
    return this.knowledgeGraph.links.filter(
      link => link.sourceId === contentId || link.targetId === contentId
    );
  }

  /**
   * Get knowledge graph statistics
   */
  getGraphStats(): {
    nodeCount: number;
    linkCount: number;
    averageLinks: number;
    linkTypes: Record<string, number>;
  } {
    const linkTypes = this.knowledgeGraph.links.reduce(
      (acc, link) => {
        acc[link.linkType] = (acc[link.linkType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      nodeCount: this.knowledgeGraph.nodes.size,
      linkCount: this.knowledgeGraph.links.length,
      averageLinks: this.knowledgeGraph.links.length / this.knowledgeGraph.nodes.size || 0,
      linkTypes,
    };
  }

  /**
   * Export knowledge graph for visualization
   */
  exportGraph(): KnowledgeGraph {
    return {
      nodes: new Map(this.knowledgeGraph.nodes),
      links: [...this.knowledgeGraph.links],
      clusters: [...this.knowledgeGraph.clusters],
    };
  }

  /**
   * Clear the knowledge graph
   */
  clear(): void {
    this.knowledgeGraph.nodes.clear();
    this.knowledgeGraph.links = [];
    this.knowledgeGraph.clusters = [];
  }
}
