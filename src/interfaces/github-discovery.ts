/**
 * GitHub Discovery Interface
 * GitHub-specific discovery operations and search capabilities
 */

import { ContentItem, ContentResult } from '@/types';
import { IContentDiscovery } from '@/interfaces/content-discovery.ts';

/**
 * GitHub-specific content discovery interface
 */
export interface IGitHubDiscovery extends IContentDiscovery {
  /**
   * Search GitHub repositories
   */
  searchRepositories(query: string, options?: GitHubSearchOptions): Promise<ContentResult>;

  /**
   * Get repository details including README and documentation
   */
  getRepositoryDetails(owner: string, repo: string): Promise<ContentItem>;

  /**
   * Search code within repositories
   */
  searchCode(query: string, options?: GitHubCodeSearchOptions): Promise<ContentResult>;

  /**
   * Get repository issues
   */
  getRepositoryIssues(
    owner: string,
    repo: string,
    options?: GitHubIssueOptions
  ): Promise<ContentItem[]>;

  /**
   * Get repository pull requests
   */
  getRepositoryPRs(owner: string, repo: string, options?: GitHubPROptions): Promise<ContentItem[]>;
}

/**
 * GitHub repository search options
 */
export interface GitHubSearchOptions {
  language?: string;
  stars?: string;
  forks?: string;
  size?: string;
  license?: string;
  topic?: string;
  user?: string;
  org?: string;
  sort?: 'score' | 'updated' | 'stars' | 'forks';
  order?: 'asc' | 'desc';
  limit?: number;
}

/**
 * GitHub code search specific options
 */
export interface GitHubCodeSearchOptions extends GitHubSearchOptions {
  filename?: string;
  extension?: string;
  path?: string;
  repo?: string;
}

/**
 * GitHub issues search options
 */
export interface GitHubIssueOptions {
  state?: 'open' | 'closed' | 'all';
  labels?: string[];
  sort?: 'created' | 'updated' | 'comments';
  direction?: 'asc' | 'desc';
  since?: string;
}

/**
 * GitHub pull requests search options
 */
export interface GitHubPROptions {
  state?: 'open' | 'closed' | 'all';
  sort?: 'created' | 'updated' | 'popularity';
  direction?: 'asc' | 'desc';
  base?: string;
  head?: string;
}
