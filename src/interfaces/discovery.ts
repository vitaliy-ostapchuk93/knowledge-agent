/**
 * Content discovery interfaces for various platforms and sources
 */

import { ContentItem, ContentResult, SearchOptions } from '@/types';

/**
 * Base interface for all content discovery implementations
 */
export interface IContentDiscovery {
  /**
   * Search for content based on query and options
   */
  discover(query: string, options?: SearchOptions): Promise<ContentResult>;
}

/**
 * GitHub-specific content discovery for repositories, issues, and discussions
 */
export interface IGitHubDiscovery extends IContentDiscovery {
  /**
   * Search GitHub repositories
   */
  searchRepositories(query: string, options?: GitHubSearchOptions): Promise<ContentResult>;

  /**
   * Search GitHub issues and pull requests
   */
  searchIssues(query: string, options?: GitHubSearchOptions): Promise<ContentResult>;

  /**
   * Search GitHub discussions
   */
  searchDiscussions(query: string, options?: GitHubSearchOptions): Promise<ContentResult>;
}

/**
 * Stack Overflow content discovery for questions and answers
 */
export interface IStackOverflowDiscovery extends IContentDiscovery {
  /**
   * Search Stack Overflow questions
   */
  searchQuestions(query: string, options?: StackOverflowSearchOptions): Promise<ContentResult>;

  /**
   * Get answers for specific question
   */
  getAnswers(questionId: number): Promise<ContentItem[]>;
}

/**
 * Reddit content discovery for posts and comments
 */
export interface IRedditDiscovery extends IContentDiscovery {
  /**
   * Search Reddit posts across subreddits
   */
  searchPosts(query: string, options?: RedditSearchOptions): Promise<ContentResult>;

  /**
   * Search within specific subreddit
   */
  searchSubreddit(
    subreddit: string,
    query: string,
    options?: RedditSearchOptions
  ): Promise<ContentResult>;
}

/**
 * GitHub-specific search options
 */
export interface GitHubSearchOptions extends SearchOptions {
  /** Filter by programming language */
  language?: string;
  /** Filter by repository size */
  size?: 'small' | 'medium' | 'large';
  /** Sort by stars, forks, or updated */
  sort?: 'stars' | 'forks' | 'updated';
  /** Search in specific organization */
  org?: string;
}

/**
 * Stack Overflow search options
 */
export interface StackOverflowSearchOptions extends SearchOptions {
  /** Filter by tags */
  tags?: string[];
  /** Sort by votes, activity, or creation */
  sort?: 'votes' | 'activity' | 'creation';
  /** Filter by answer status */
  answered?: boolean;
}

/**
 * Reddit search options
 */
export interface RedditSearchOptions extends SearchOptions {
  /** Specific subreddit to search */
  subreddit?: string;
  /** Sort by hot, new, top, or relevance */
  sort?: 'hot' | 'new' | 'top' | 'relevance';
  /** Time period for top posts */
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
}
