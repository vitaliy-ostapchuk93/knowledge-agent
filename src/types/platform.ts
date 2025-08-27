/**
 * Platform Integration Types
 * Types for different knowledge management platforms
 */

export enum PlatformType {
  LOGSEQ = 'logseq',
  OBSIDIAN = 'obsidian',
  NOTION = 'notion',
  ROAM = 'roam',
}

export interface FormattedContent {
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  links: string[];
  tags: string[];
  format: PlatformType;
}

export interface ExistingContent {
  id: string;
  title: string;
  content: string;
  tags: string[];
  links: string[];
  lastModified: Date;
}
