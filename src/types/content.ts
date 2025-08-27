/**
 * Core Content Types
 * Defines the fundamental content structures used throughout the system
 */

export interface ContentItem {
  id: string;
  title: string;
  url: string;
  content: string;
  source: ContentSource;
  metadata: ContentMetadata;
  relevanceScore: number;
  timestamp: Date;
}

export interface DiscoveredContent {
  id: string;
  title: string;
  content: string;
  source: ContentSource;
  url?: string;
  metadata: Record<string, unknown>;
  relevanceScore: number;
  tags: string[];
}

export interface ContentMetadata {
  author?: string;
  publishDate?: Date;
  tags: string[];
  contentType: ContentType;
  wordCount: number;
  language: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export enum ContentSource {
  YOUTUBE = 'youtube',
  REDDIT = 'reddit',
  STACKOVERFLOW = 'stackoverflow',
  GITHUB = 'github',
  DOCUMENTATION = 'documentation',
  TECH_BLOG = 'tech_blog',
  ACADEMIC_PAPER = 'academic_paper',
  TUTORIAL = 'tutorial',
  WEB = 'web',
  LOCAL_FILE = 'local_file',
}

export enum ContentType {
  VIDEO = 'video',
  ARTICLE = 'article',
  DOCUMENTATION = 'documentation',
  CODE_SNIPPET = 'code_snippet',
  DISCUSSION = 'discussion',
  TUTORIAL = 'tutorial',
  RESEARCH_PAPER = 'paper',
}

export interface CodeExample {
  language: string;
  code: string;
  description: string;
  runnable?: boolean;
}

export interface RelatedLink {
  title: string;
  url: string;
  description: string;
  relationship: 'prerequisite' | 'related' | 'advanced' | 'alternative';
}
