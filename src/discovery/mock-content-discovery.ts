/**
 * Mock Content Discovery Service - No API Keys Required
 * Simulates content discovery from various sources
 */

import {
  ContentItem,
  ContentSource,
  ContentType,
  ContentResult,
  SearchOptions,
} from '../types/index.js';
import { IContentDiscovery } from '../interfaces/index.js';

export class MockContentDiscovery implements IContentDiscovery {
  private mockDatabase: ContentItem[] = [];

  constructor() {
    this.initializeMockData();
  }

  /**
   * Search for content across multiple sources
   */
  async searchContent(options: SearchOptions): Promise<ContentResult> {
    const start = Date.now();

    console.log(`🔍 Searching for: "${options.query}"`);

    // Simulate network delay
    await this.delay(100);

    const results = this.mockDatabase
      .filter(item => this.isRelevant(item, options.query))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, options.maxResults || 5);

    // Generate additional dynamic content if needed
    const maxResults = options.maxResults || 5;
    if (results.length < maxResults) {
      const additionalContent = this.generateDynamicContent(
        options.query,
        maxResults - results.length
      );
      results.push(...additionalContent);
    }

    const searchTime = Date.now() - start;
    console.log(`✅ Found ${results.length} items in ${searchTime}ms`);

    return {
      items: results,
      totalFound: results.length,
      searchTime,
      sources: results.map(item => item.source),
    };
  }

  /**
   * Get content from specific URL (mock implementation)
   */
  async getContentFromUrl(url: string): Promise<ContentItem | null> {
    await this.delay(50);
    return this.mockDatabase.find(item => item.url === url) || null;
  }

  /**
   * Get trending content for a topic (mock implementation)
   */
  async getTrendingContent(
    topic: string,
    _timeframe: 'day' | 'week' | 'month' = 'week'
  ): Promise<ContentItem[]> {
    await this.delay(200);
    return this.mockDatabase
      .filter(item => this.isRelevant(item, topic))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
  }

  /**
   * Get related content based on existing content (mock implementation)
   */
  async getRelatedContent(content: ContentItem): Promise<ContentItem[]> {
    await this.delay(150);
    return this.mockDatabase
      .filter(
        item =>
          item.id !== content.id &&
          item.metadata.tags.some(tag => content.metadata.tags.includes(tag))
      )
      .slice(0, 5);
  }

  /**
   * Discover content based on query
   */
  async discoverContent(query: string, maxResults: number = 5): Promise<ContentItem[]> {
    console.log(`🔍 Discovering content for: "${query}"`);

    // Simulate network delay
    await this.delay(800);

    const results = this.mockDatabase
      .filter(item => this.isRelevant(item, query))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);

    // Generate additional dynamic content if needed
    if (results.length < maxResults) {
      const additionalContent = this.generateDynamicContent(query, maxResults - results.length);
      results.push(...additionalContent);
    }

    console.log(`✅ Found ${results.length} relevant items`);
    return results;
  }

  /**
   * Initialize mock content database
   */
  private initializeMockData(): void {
    this.mockDatabase = [
      {
        id: 'react-components-guide',
        title: 'Complete Guide to React Components',
        url: 'https://reactjs.org/docs/components-and-props.html',
        content: `React components are the building blocks of React applications. They let you split the UI into independent, reusable pieces, and think about each piece in isolation.

## Function Components

The simplest way to define a component is to write a JavaScript function:

\`\`\`javascript
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

This function is a valid React component because it accepts a single "props" object argument with data and returns a React element.

## Class Components

You can also use ES6 classes to define components:

\`\`\`javascript
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
\`\`\`

## Best Practices

- Keep components small and focused
- Use descriptive names for components
- Extract reusable logic into custom hooks
- Prefer function components with hooks over class components`,
        source: ContentSource.DOCUMENTATION,
        metadata: {
          author: 'React Team',
          publishDate: new Date('2024-01-15'),
          tags: ['react', 'components', 'javascript', 'frontend'],
          contentType: ContentType.DOCUMENTATION,
          wordCount: 180,
          language: 'en',
          difficulty: 'intermediate',
        },
        relevanceScore: 0.95,
        timestamp: new Date(),
      },
      {
        id: 'typescript-best-practices',
        title: 'TypeScript Best Practices for 2024',
        url: 'https://blog.example.com/typescript-best-practices',
        content: `TypeScript has become the standard for building scalable JavaScript applications. Here are the most important best practices to follow in 2024.

## Use Strict Mode

Always enable strict mode in your TypeScript configuration:

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
\`\`\`

## Prefer Interfaces Over Types

For object shapes, prefer interfaces over type aliases:

\`\`\`typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

// Avoid for object shapes
type User = {
  id: string;
  name: string;
  email: string;
}
\`\`\`

## Use Utility Types

Leverage TypeScript's built-in utility types:

\`\`\`typescript
type PartialUser = Partial<User>;
type UserEmail = Pick<User, 'email'>;
type UserWithoutId = Omit<User, 'id'>;
\`\`\``,
        source: ContentSource.TECH_BLOG,
        metadata: {
          author: 'TypeScript Expert',
          publishDate: new Date('2024-02-10'),
          tags: ['typescript', 'best-practices', 'javascript', 'development'],
          contentType: ContentType.ARTICLE,
          wordCount: 220,
          language: 'en',
          difficulty: 'intermediate',
        },
        relevanceScore: 0.9,
        timestamp: new Date(),
      },
      {
        id: 'database-design-patterns',
        title: 'Essential Database Design Patterns',
        url: 'https://docs.example.com/database-patterns',
        content: `Database design patterns are proven solutions to common database design problems. Understanding these patterns is crucial for building scalable and maintainable applications.

## Repository Pattern

The Repository pattern encapsulates data access logic:

\`\`\`typescript
interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

class PostgresUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    // Implementation details
  }
}
\`\`\`

## Unit of Work Pattern

Maintains a list of objects affected by a business transaction:

\`\`\`typescript
class UnitOfWork {
  private newObjects: any[] = [];
  private dirtyObjects: any[] = [];
  private removedObjects: any[] = [];

  registerNew(object: any): void {
    this.newObjects.push(object);
  }

  async commit(): Promise<void> {
    // Save all changes in a transaction
  }
}
\`\`\`

## Key Benefits

- Separation of concerns
- Testability
- Maintainability
- Scalability`,
        source: ContentSource.DOCUMENTATION,
        metadata: {
          author: 'Database Expert',
          publishDate: new Date('2024-03-01'),
          tags: ['database', 'design-patterns', 'architecture', 'backend'],
          contentType: ContentType.TUTORIAL,
          wordCount: 280,
          language: 'en',
          difficulty: 'advanced',
        },
        relevanceScore: 0.88,
        timestamp: new Date(),
      },
      {
        id: 'react-server-components',
        title: 'Understanding React Server Components',
        url: 'https://nextjs.org/docs/app/building-your-application/rendering/server-components',
        content: `React Server Components represent a new paradigm in React that allows components to render on the server, reducing the JavaScript bundle size and improving performance.

## What are Server Components?

Server Components are React components that render on the server rather than the client. They have several key characteristics:

- They run on the server during build time or request time
- They cannot use browser-only APIs
- They cannot use state or effects
- They can directly access backend resources

## Example Server Component

\`\`\`jsx
// This is a Server Component
async function BlogPost({ id }) {
  // This runs on the server
  const post = await fetch(\`/api/posts/\${id}\`);
  const data = await post.json();
  
  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </article>
  );
}
\`\`\`

## Benefits

1. **Reduced Bundle Size**: Server components don't add to the client JavaScript bundle
2. **Better Performance**: Direct access to data sources without additional API calls
3. **Improved SEO**: Content is rendered on the server and available immediately
4. **Security**: Sensitive operations can stay on the server`,
        source: ContentSource.DOCUMENTATION,
        metadata: {
          author: 'Next.js Team',
          publishDate: new Date('2024-01-20'),
          tags: ['react', 'server-components', 'nextjs', 'performance'],
          contentType: ContentType.DOCUMENTATION,
          wordCount: 240,
          language: 'en',
          difficulty: 'advanced',
        },
        relevanceScore: 0.92,
        timestamp: new Date(),
      },
      {
        id: 'nodejs-performance-tips',
        title: 'Node.js Performance Optimization Tips',
        url: 'https://nodejs.org/en/docs/guides/simple-profiling/',
        content: `Node.js applications can achieve excellent performance when optimized correctly. Here are proven techniques to improve your Node.js application performance.

## Use Async/Await Properly

Avoid blocking the event loop with synchronous operations:

\`\`\`javascript
// Bad - blocks the event loop
const data = fs.readFileSync('large-file.txt');

// Good - non-blocking
const data = await fs.readFile('large-file.txt');
\`\`\`

## Implement Caching

Cache frequently accessed data to reduce database queries:

\`\`\`javascript
const cache = new Map();

async function getUserData(userId) {
  if (cache.has(userId)) {
    return cache.get(userId);
  }
  
  const userData = await database.findUser(userId);
  cache.set(userId, userData);
  return userData;
}
\`\`\`

## Connection Pooling

Use connection pooling for database connections:

\`\`\`javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of connections
  min: 5,  // Minimum number of connections
});
\`\`\`

## Key Performance Metrics

- Response time
- Throughput
- Memory usage
- CPU utilization`,
        source: ContentSource.DOCUMENTATION,
        metadata: {
          author: 'Node.js Team',
          publishDate: new Date('2024-02-15'),
          tags: ['nodejs', 'performance', 'optimization', 'backend'],
          contentType: ContentType.TUTORIAL,
          wordCount: 200,
          language: 'en',
          difficulty: 'intermediate',
        },
        relevanceScore: 0.85,
        timestamp: new Date(),
      },
    ];
  }

  /**
   * Check if content is relevant to query
   */
  private isRelevant(item: ContentItem, query: string): boolean {
    const searchTerms = query.toLowerCase().split(/\s+/);
    const searchableText = [
      item.title,
      item.content,
      ...item.metadata.tags,
      item.metadata.author || '',
    ]
      .join(' ')
      .toLowerCase();

    return searchTerms.some(term => searchableText.includes(term));
  }

  /**
   * Generate dynamic content based on query
   */
  private generateDynamicContent(query: string, count: number): ContentItem[] {
    const results: ContentItem[] = [];

    for (let i = 0; i < count; i++) {
      const id = `dynamic-${query.replace(/\s+/g, '-')}-${Date.now()}-${i}`;

      results.push({
        id,
        title: `${query} - Comprehensive Guide ${i + 1}`,
        url: `https://example.com/${id}`,
        content: this.generateContentText(query),
        source: this.getRandomSource(),
        metadata: {
          author: 'Knowledge Expert',
          publishDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          tags: this.generateTags(query),
          contentType: this.getRandomContentType(),
          wordCount: 150 + Math.floor(Math.random() * 200),
          language: 'en',
          difficulty: this.getRandomDifficulty(),
        },
        relevanceScore: 0.7 + Math.random() * 0.25,
        timestamp: new Date(),
      });
    }

    return results;
  }

  /**
   * Generate content text for a query
   */
  private generateContentText(query: string): string {
    const templates = [
      `This comprehensive guide covers everything you need to know about ${query}. We'll explore the fundamental concepts, best practices, and real-world examples.

## Key Concepts

Understanding ${query} requires grasping several important concepts that form the foundation of effective implementation.

## Best Practices

When working with ${query}, follow these proven best practices:

1. Start with a solid understanding of the basics
2. Practice with small, manageable examples
3. Gradually increase complexity as you gain confidence
4. Always consider performance implications
5. Test thoroughly before deploying to production

## Common Pitfalls

Avoid these common mistakes when implementing ${query}:

- Rushing into complex implementations without understanding basics
- Ignoring performance considerations
- Not following established patterns and conventions`,

      `${query} is an essential topic for modern development. This article provides practical insights and actionable advice.

## Getting Started

To begin with ${query}, you'll need to understand the core principles and how they apply to real-world scenarios.

## Implementation Guide

Follow this step-by-step approach:

1. Set up your development environment
2. Create a simple example to test understanding
3. Iterate and improve based on requirements
4. Optimize for performance and maintainability

## Advanced Techniques

Once you've mastered the basics, explore these advanced techniques to take your ${query} skills to the next level.`,

      `Learn ${query} with this detailed tutorial that covers both theory and practical application.

## Why ${query} Matters

In today's development landscape, ${query} plays a crucial role in building robust, scalable applications.

## Practical Examples

Here are some practical examples that demonstrate key concepts:

- Basic implementation patterns
- Error handling strategies
- Performance optimization techniques
- Testing approaches

## Next Steps

After completing this guide, you'll be ready to implement ${query} in your own projects with confidence.`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Generate tags for a query
   */
  private generateTags(query: string): string[] {
    const queryTags = query.toLowerCase().split(/\s+/);
    const commonTags = ['tutorial', 'guide', 'best-practices', 'development', 'programming'];

    return [...queryTags, ...commonTags.slice(0, 2)];
  }

  /**
   * Get random content source
   */
  private getRandomSource(): ContentSource {
    const sources = Object.values(ContentSource);
    return sources[Math.floor(Math.random() * sources.length)];
  }

  /**
   * Get random content type
   */
  private getRandomContentType(): ContentType {
    const types = Object.values(ContentType);
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Get random difficulty level
   */
  private getRandomDifficulty(): 'beginner' | 'intermediate' | 'advanced' {
    const difficulties = ['beginner', 'intermediate', 'advanced'] as const;
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  }

  /**
   * Simulate network delay
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
