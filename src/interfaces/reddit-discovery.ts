/**
 * Reddit Discovery Interface
 * Reddit-specific discovery operations and search capabilities
 */

import { ContentItem, ContentResult } from '@/types';
import { IContentDiscovery } from '@/interfaces/content-discovery.ts';

/**
 * Reddit-specific content discovery interface
 */
export interface IRedditDiscovery extends IContentDiscovery {
  /**
   * Search Reddit posts across subreddits
   */
  searchPosts(query: string, options?: RedditSearchOptions): Promise<ContentResult>;

  /**
   * Get subreddit information and top posts
   */
  getSubredditPosts(subreddit: string, options?: RedditSubredditOptions): Promise<ContentResult>;

  /**
   * Search comments within posts
   */
  searchComments(query: string, options?: RedditSearchOptions): Promise<ContentResult>;

  /**
   * Get trending subreddits for a topic
   */
  getTrendingSubreddits(topic: string): Promise<string[]>;

  /**
   * Get user's top posts
   */
  getUserPosts(username: string, options?: RedditUserOptions): Promise<ContentItem[]>;
}

/**
 * Reddit search options
 */
export interface RedditSearchOptions {
  subreddit?: string;
  sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments';
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  type?: 'link' | 'sr' | 'user';
  nsfw?: boolean;
  limit?: number;
}

/**
 * Reddit subreddit-specific options
 */
export interface RedditSubredditOptions {
  sort?: 'hot' | 'new' | 'top' | 'rising';
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  limit?: number;
}

/**
 * Reddit user-specific options
 */
export interface RedditUserOptions {
  sort?: 'hot' | 'new' | 'top';
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  type?: 'links' | 'comments';
  limit?: number;
}
