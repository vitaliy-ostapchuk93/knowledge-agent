import { DiscoveredContent, ContentSource } from '@/types';
import { PATHS } from '@/tests/utils/test-utils.ts';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Mock Data Loader - Loads realistic mock data from JSON files
 * Provides consistent, high-quality test data for discovery components
 */
export class MockDataLoader {
  /**
   * Load mock web content
   */
  static loadWebContent(): DiscoveredContent[] {
    const filePath = join(PATHS.testDataDir, 'mock-web-content.json');
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Load mock YouTube content
   */
  static loadYouTubeContent(): DiscoveredContent[] {
    const filePath = join(PATHS.testDataDir, 'mock-youtube-content.json');
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Load mock Reddit content
   */
  static loadRedditContent(): DiscoveredContent[] {
    const filePath = join(PATHS.testDataDir, 'mock-reddit-content.json');
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Load mock GitHub content
   */
  static loadGitHubContent(): DiscoveredContent[] {
    const filePath = join(PATHS.testDataDir, 'mock-github-content.json');
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Load mock Stack Overflow content
   */
  static loadStackOverflowContent(): DiscoveredContent[] {
    const filePath = join(PATHS.testDataDir, 'mock-stackoverflow-content.json');
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Get content by source type
   */
  static getContentBySource(source: ContentSource): DiscoveredContent[] {
    switch (source) {
      case ContentSource.WEB:
        return this.loadWebContent();
      case ContentSource.YOUTUBE:
        return this.loadYouTubeContent();
      case ContentSource.REDDIT:
        return this.loadRedditContent();
      case ContentSource.GITHUB:
        return this.loadGitHubContent();
      case ContentSource.STACKOVERFLOW:
        return this.loadStackOverflowContent();
      default:
        return [];
    }
  }

  /**
   * Search content by query (simple keyword matching)
   */
  static searchContent(query: string, sources?: ContentSource[]): DiscoveredContent[] {
    const queryLower = query.toLowerCase();
    const searchSources = sources || [
      ContentSource.WEB,
      ContentSource.YOUTUBE,
      ContentSource.REDDIT,
      ContentSource.GITHUB,
      ContentSource.STACKOVERFLOW
    ];

    let allContent: DiscoveredContent[] = [];
    
    for (const source of searchSources) {
      allContent = allContent.concat(this.getContentBySource(source));
    }

    return allContent.filter(item => 
      item.title.toLowerCase().includes(queryLower) ||
      item.content.toLowerCase().includes(queryLower) ||
      item.tags.some(tag => tag.toLowerCase().includes(queryLower))
    );
  }

  /**
   * Get content by specific tags
   */
  static getContentByTags(tags: string[]): DiscoveredContent[] {
    const allSources = [
      ContentSource.WEB,
      ContentSource.YOUTUBE,
      ContentSource.REDDIT,
      ContentSource.GITHUB,
      ContentSource.STACKOVERFLOW
    ];

    let allContent: DiscoveredContent[] = [];
    
    for (const source of allSources) {
      allContent = allContent.concat(this.getContentBySource(source));
    }

    return allContent.filter(item =>
      tags.some(tag => 
        item.tags.includes(tag.toLowerCase()) ||
        item.title.toLowerCase().includes(tag.toLowerCase())
      )
    );
  }

  /**
   * Get trending content (highest relevance scores)
   */
  static getTrendingContent(count: number = 10): DiscoveredContent[] {
    const allSources = [
      ContentSource.WEB,
      ContentSource.YOUTUBE,
      ContentSource.REDDIT,
      ContentSource.GITHUB,
      ContentSource.STACKOVERFLOW
    ];

    let allContent: DiscoveredContent[] = [];
    
    for (const source of allSources) {
      allContent = allContent.concat(this.getContentBySource(source));
    }

    return allContent
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, count);
  }

  /**
   * Get random sample of content
   */
  static getRandomSample(count: number = 5, source?: ContentSource): DiscoveredContent[] {
    let content: DiscoveredContent[];
    
    if (source) {
      content = this.getContentBySource(source);
    } else {
      const allSources = [
        ContentSource.WEB,
        ContentSource.YOUTUBE,
        ContentSource.REDDIT,
        ContentSource.GITHUB,
        ContentSource.STACKOVERFLOW
      ];
      
      content = [];
      for (const src of allSources) {
        content = content.concat(this.getContentBySource(src));
      }
    }

    // Shuffle array and return sample
    const shuffled = [...content].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Filter content by relevance score range
   */
  static filterByRelevanceScore(
    minScore: number = 0, 
    maxScore: number = 1, 
    source?: ContentSource
  ): DiscoveredContent[] {
    let content: DiscoveredContent[];
    
    if (source) {
      content = this.getContentBySource(source);
    } else {
      const allSources = [
        ContentSource.WEB,
        ContentSource.YOUTUBE,
        ContentSource.REDDIT,
        ContentSource.GITHUB,
        ContentSource.STACKOVERFLOW
      ];
      
      content = [];
      for (const src of allSources) {
        content = content.concat(this.getContentBySource(src));
      }
    }

    return content.filter(item => 
      item.relevanceScore >= minScore && item.relevanceScore <= maxScore
    );
  }

  /**
   * Get content statistics
   */
  static getContentStats(): {
    totalItems: number;
    bySource: Record<string, number>;
    averageRelevanceScore: number;
    topTags: Array<{ tag: string; count: number }>;
  } {
    const allSources = [
      ContentSource.WEB,
      ContentSource.YOUTUBE,
      ContentSource.REDDIT,
      ContentSource.GITHUB,
      ContentSource.STACKOVERFLOW
    ];

    let allContent: DiscoveredContent[] = [];
    const bySource: Record<string, number> = {};
    
    for (const source of allSources) {
      const sourceContent = this.getContentBySource(source);
      allContent = allContent.concat(sourceContent);
      bySource[source] = sourceContent.length;
    }

    const totalRelevanceScore = allContent.reduce((sum, item) => sum + item.relevanceScore, 0);
    const averageRelevanceScore = totalRelevanceScore / allContent.length;

    // Count tags
    const tagCounts: Record<string, number> = {};
    allContent.forEach(item => {
      item.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalItems: allContent.length,
      bySource,
      averageRelevanceScore: Math.round(averageRelevanceScore * 100) / 100,
      topTags
    };
  }
}
