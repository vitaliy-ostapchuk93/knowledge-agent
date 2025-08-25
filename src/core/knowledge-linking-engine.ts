/**
 * Knowledge Linking Engine
 * Automatically detects relationships between content and creates bidirectional links
 */

import { DiscoveredContent } from '@/types/index.js';

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

  /**
   * Add content to the knowledge graph and detect links
   */
  async addContent(content: DiscoveredContent, options: LinkingOptions = {}): Promise<KnowledgeLink[]> {
    console.log(`🔗 Adding content to knowledge graph: "${content.title}"`);
    
    // Add to graph
    this.knowledgeGraph.nodes.set(content.id, content);
    
    // Detect links with existing content
    const newLinks = await this.detectLinks(content, options);
    
    // Add links to graph
    this.knowledgeGraph.links.push(...newLinks);
    
    console.log(`🔗 Found ${newLinks.length} new links for "${content.title}"`);
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
    return links
      .sort((a, b) => b.strength - a.strength)
      .slice(0, maxLinks);
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
  private calculateTagOverlap(tags1: string[], tags2: string[]): {
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
   * Calculate content similarity using keyword analysis
   */
  private calculateContentSimilarity(content1: string, content2: string): {
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
      'api', 'database', 'component', 'function', 'class', 'method', 'interface',
      'framework', 'library', 'service', 'module', 'package', 'dependency',
      'authentication', 'authorization', 'middleware', 'routing', 'testing',
      'deployment', 'performance', 'security', 'optimization', 'caching',
    ];
    
    const foundConcepts = commonConcepts.filter(concept =>
      content.toLowerCase().includes(concept)
    );
    
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
   * Check if content mentions a specific technology/concept
   */
  private contentMentions(content: DiscoveredContent, term: string): boolean {
    const searchText = `${content.title} ${content.content} ${content.tags.join(' ')}`.toLowerCase();
    return searchText.includes(term.toLowerCase());
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
   * Detect topic-subtopic hierarchy
   */
  private detectTopicHierarchy(
    content1: DiscoveredContent,
    content2: DiscoveredContent
  ): KnowledgeLink | null {
    // This would be more sophisticated in a real implementation
    // For now, we'll use simple keyword matching
    
    if (content1.title.toLowerCase().includes('javascript') && 
        content2.title.toLowerCase().includes('typescript')) {
      return {
        sourceId: content1.id,
        targetId: content2.id,
        linkType: 'hierarchy',
        strength: 0.6,
        reason: 'TypeScript extends JavaScript',
        bidirectional: false,
      };
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
    const linkTypes = this.knowledgeGraph.links.reduce((acc, link) => {
      acc[link.linkType] = (acc[link.linkType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
