/**
 * Knowledge Linking Types
 * Types for the knowledge graph and semantic linking system
 */

import { ContentItem } from '@/types/content.ts';

export interface SemanticLink {
  source: ContentItem;
  target: ContentItem;
  type: 'similar' | 'related' | 'dependency' | 'contradicts';
  confidence: number;
  reason: string;
}

export interface Topic {
  name: string;
  confidence: number;
  keywords: string[];
  category: string;
}

export interface KnowledgeGraph {
  nodes: ContentItem[];
  links: SemanticLink[];
  topics: Topic[];
  metadata: {
    createdAt: Date;
    nodeCount: number;
    linkCount: number;
  };
}
