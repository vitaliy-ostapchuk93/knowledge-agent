import { faker } from '@faker-js/faker';
import { DiscoveredContent, ContentSource } from '@/types';

/**
 * Mock Data Generator for Discovery Components
 * Provides realistic test data for web, YouTube, and Reddit content
 */
export class MockDataGenerator {
  /**
   * Generate mock web content
   */
  static generateWebContent(query: string, count: number = 5): DiscoveredContent[] {
    return Array.from({ length: count }, () => {
      const domain = faker.internet.domainName();
      const contentTypes = ['article', 'tutorial', 'documentation', 'blog', 'guide'];
      const contentType = faker.helpers.arrayElement(contentTypes);

      return {
        id: `web-${faker.string.uuid()}`,
        title: `${query} - ${faker.lorem.words(3)} from ${domain}`,
        content: faker.lorem.paragraphs(2, '\n\n'),
        source: ContentSource.WEB,
        url: `https://${domain}/${faker.lorem.slug()}`,
        metadata: {
          domain,
          contentType,
          scrapedAt: faker.date.recent().toISOString(),
          author: faker.person.fullName(),
          publishDate: faker.date.past().toISOString(),
          wordCount: faker.number.int({ min: 500, max: 3000 }),
          language: 'en',
        },
        relevanceScore: faker.number.float({ min: 0.7, max: 1.0, fractionDigits: 2 }),
        tags: [
          'web-content',
          contentType,
          query.toLowerCase().replace(/\s+/g, '-'),
          ...faker.lorem.words(2).split(' '),
        ],
      };
    });
  }

  /**
   * Generate mock YouTube content
   */
  static generateYouTubeContent(query: string, count: number = 5): DiscoveredContent[] {
    return Array.from({ length: count }, () => {
      const channel =
        faker.company.name() +
        ' ' +
        faker.helpers.arrayElement(['TV', 'Channel', 'Academy', 'Tech', 'Dev']);
      const videoId = faker.string.alphanumeric(11);
      const duration = `${faker.number.int({ min: 1, max: 60 })}:${faker.number.int({ min: 10, max: 59 })}`;

      return {
        id: `youtube-${faker.string.uuid()}`,
        title: `${query} - ${faker.lorem.words(4)}`,
        content: `${faker.lorem.paragraph()} Duration: ${duration}. ${faker.lorem.sentence()}`,
        source: ContentSource.YOUTUBE,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        metadata: {
          channel,
          duration,
          videoId,
          uploadDate: faker.date.past().toISOString(),
          viewCount: faker.number.int({ min: 1000, max: 1000000 }),
          likeCount: faker.number.int({ min: 50, max: 50000 }),
          commentCount: faker.number.int({ min: 10, max: 5000 }),
          description: faker.lorem.paragraph(),
          tags: faker.lorem.words(5).split(' '),
          contentType: 'video',
        },
        relevanceScore: faker.number.float({ min: 0.7, max: 1.0, fractionDigits: 2 }),
        tags: [
          'youtube',
          'video',
          'tutorial',
          query.toLowerCase().replace(/\s+/g, '-'),
          ...faker.lorem.words(2).split(' '),
        ],
      };
    });
  }

  /**
   * Generate mock Reddit content
   */
  static generateRedditContent(query: string, count: number = 3): DiscoveredContent[] {
    const relevantSubreddits = this.getRelevantSubreddits(query);

    return Array.from({ length: count }, () => {
      const subreddit = faker.helpers.arrayElement(relevantSubreddits);
      const postId = faker.string.alphanumeric(8);
      const author = faker.internet.username();
      const flairs = ['Discussion', 'Help', 'Tutorial', 'Question', 'Resource', 'News'];

      return {
        id: `reddit-${faker.string.uuid()}`,
        title: `${query} - ${faker.lorem.words(5)}`,
        content: faker.lorem.paragraphs(3, '\n\n'),
        source: ContentSource.REDDIT,
        url: `https://www.reddit.com/r/${subreddit}/comments/${postId}/${faker.lorem.slug()}/`,
        metadata: {
          subreddit,
          postId,
          author,
          score: faker.number.int({ min: 10, max: 2000 }),
          commentCount: faker.number.int({ min: 5, max: 500 }),
          createdAt: faker.date.past().toISOString(),
          flair: faker.helpers.arrayElement(flairs),
          isStickied: faker.datatype.boolean({ probability: 0.1 }),
          isLocked: faker.datatype.boolean({ probability: 0.05 }),
          awards: faker.number.int({ min: 0, max: 10 }),
          contentType: 'discussion',
        },
        relevanceScore: faker.number.float({ min: 0.6, max: 1.0, fractionDigits: 2 }),
        tags: [
          'reddit',
          'discussion',
          subreddit,
          query.toLowerCase().replace(/\s+/g, '-'),
          ...faker.lorem.words(2).split(' '),
        ],
      };
    });
  }

  /**
   * Generate mock trending Reddit posts
   */
  static generateTrendingRedditPosts(
    subreddit: string,
    timeframe: string,
    count: number = 5
  ): DiscoveredContent[] {
    return Array.from({ length: count }, () => {
      const postId = faker.string.alphanumeric(8);
      const author = faker.internet.username();
      const trendingTopics = [
        'Breaking: Major update released',
        'Hot discussion trending now',
        'Community favorite this week',
        'Expert AMA session',
        'Best practices guide updated',
      ];

      return {
        id: `reddit-trending-${faker.string.uuid()}`,
        title: faker.helpers.arrayElement(trendingTopics),
        content: faker.lorem.paragraphs(2, '\n\n'),
        source: ContentSource.REDDIT,
        url: `https://www.reddit.com/r/${subreddit}/comments/${postId}/${faker.lorem.slug()}/`,
        metadata: {
          subreddit,
          postId,
          author,
          score: faker.number.int({ min: 500, max: 5000 }), // Higher scores for trending
          commentCount: faker.number.int({ min: 50, max: 1000 }),
          createdAt: faker.date.recent().toISOString(),
          flair: 'Hot',
          timeframe,
          isStickied: faker.datatype.boolean({ probability: 0.2 }),
          awards: faker.number.int({ min: 2, max: 20 }),
          contentType: 'discussion',
        },
        relevanceScore: faker.number.float({ min: 0.8, max: 1.0, fractionDigits: 2 }),
        tags: ['reddit', 'trending', subreddit, timeframe, 'hot'],
      };
    });
  }

  /**
   * Generate mock GitHub repository content
   */
  static generateGitHubContent(query: string, count: number = 3): DiscoveredContent[] {
    return Array.from({ length: count }, () => {
      const owner = faker.internet.username();
      const repoName = faker.lorem.words(2).replace(/\s+/g, '-').toLowerCase();
      const language = faker.helpers.arrayElement([
        'TypeScript',
        'JavaScript',
        'Python',
        'Go',
        'Rust',
      ]);

      return {
        id: `github-${faker.string.uuid()}`,
        title: `${repoName} - ${query} implementation`,
        content: faker.lorem.paragraphs(2, '\n\n'),
        source: ContentSource.GITHUB,
        url: `https://github.com/${owner}/${repoName}`,
        metadata: {
          owner,
          repoName,
          description: faker.lorem.sentence(),
          language,
          stars: faker.number.int({ min: 1, max: 10000 }),
          forks: faker.number.int({ min: 0, max: 1000 }),
          issues: faker.number.int({ min: 0, max: 100 }),
          lastUpdate: faker.date.recent().toISOString(),
          license: faker.helpers.arrayElement(['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause']),
          topics: faker.lorem.words(3).split(' '),
          contentType: 'repository',
        },
        relevanceScore: faker.number.float({ min: 0.6, max: 1.0, fractionDigits: 2 }),
        tags: [
          'github',
          'repository',
          language.toLowerCase(),
          query.toLowerCase().replace(/\s+/g, '-'),
          ...faker.lorem.words(2).split(' '),
        ],
      };
    });
  }

  /**
   * Get relevant subreddits based on query
   */
  private static getRelevantSubreddits(query: string): string[] {
    const queryLower = query.toLowerCase();

    const subredditMap: Record<string, string[]> = {
      javascript: ['javascript', 'webdev', 'programming', 'node'],
      typescript: ['typescript', 'javascript', 'webdev', 'programming'],
      react: ['reactjs', 'javascript', 'webdev', 'frontend'],
      python: ['python', 'learnpython', 'programming', 'datascience'],
      node: ['node', 'javascript', 'webdev', 'backend'],
      docker: ['docker', 'devops', 'programming', 'containers'],
      kubernetes: ['kubernetes', 'devops', 'programming', 'cloudnative'],
      aws: ['aws', 'cloud', 'devops', 'programming'],
      api: ['programming', 'webdev', 'backend', 'api'],
      database: ['programming', 'database', 'sql', 'backend'],
    };

    for (const [keyword, subreddits] of Object.entries(subredditMap)) {
      if (queryLower.includes(keyword)) {
        return subreddits;
      }
    }

    // Default programming-related subreddits
    return ['programming', 'webdev', 'tech', 'coding'];
  }

  /**
   * Generate mixed content from multiple sources
   */
  static generateMixedContent(query: string): DiscoveredContent[] {
    return [
      ...this.generateWebContent(query, 2),
      ...this.generateYouTubeContent(query, 2),
      ...this.generateRedditContent(query, 2),
      ...this.generateGitHubContent(query, 1),
    ];
  }

  /**
   * Seed faker for deterministic testing
   */
  static seed(seedValue: number): void {
    faker.seed(seedValue);
  }

  /**
   * Reset faker seed
   */
  static resetSeed(): void {
    faker.seed();
  }
}
