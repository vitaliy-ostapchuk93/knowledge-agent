/**
 * Knowledge Linking Interfaces
 * Advanced semantic analysis and knowledge graph operations
 */

import { ContentItem } from '@/types';

/**
 * Advanced Knowledge Linking Interface
 * Semantic relationship detection and knowledge graph building
 */
export interface IAdvancedKnowledgeLinking {
  /**
   * Detect semantic relationships between content items
   */
  detectSemanticLinks(content: ContentItem[]): Promise<SemanticLink[]>;

  /**
   * Extract topics and concepts from content
   */
  extractTopics(content: ContentItem): Promise<Topic[]>;

  /**
   * Calculate semantic similarity between items
   */
  calculateSimilarity(item1: ContentItem, item2: ContentItem): Promise<number>;

  /**
   * Build knowledge graph with weighted connections
   */
  buildKnowledgeGraph(content: ContentItem[]): Promise<KnowledgeGraph>;

  /**
   * Find concept clusters in content collection
   */
  findConceptClusters(content: ContentItem[]): Promise<ConceptCluster[]>;

  /**
   * Extract entities from content (people, places, organizations, etc.)
   */
  extractEntities(content: ContentItem): Promise<Entity[]>;

  /**
   * Detect temporal relationships between content
   */
  detectTemporalRelations(content: ContentItem[]): Promise<TemporalRelation[]>;

  /**
   * Generate content recommendations based on existing knowledge
   */
  recommendContent(
    baseContent: ContentItem,
    availableContent: ContentItem[]
  ): Promise<ContentRecommendation[]>;
}

/**
 * Semantic Link representing relationships between content
 */
export interface SemanticLink {
  sourceId: string;
  targetId: string;
  relationshipType: RelationshipType;
  confidence: number;
  weight: number;
  metadata: LinkMetadata;
}

/**
 * Topic extracted from content analysis
 */
export interface Topic {
  name: string;
  confidence: number;
  keywords: string[];
  category: TopicCategory;
  weight: number;
  relatedTopics: string[];
}

/**
 * Knowledge Graph structure
 */
export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  metadata: GraphMetadata;
  statistics: GraphStatistics;
}

/**
 * Knowledge Graph Node
 */
export interface KnowledgeNode {
  id: string;
  contentId: string;
  title: string;
  type: NodeType;
  topics: Topic[];
  entities: Entity[];
  weight: number;
  centrality: number;
  metadata: NodeMetadata;
}

/**
 * Knowledge Graph Edge
 */
export interface KnowledgeEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: RelationshipType;
  weight: number;
  confidence: number;
  metadata: EdgeMetadata;
}

/**
 * Concept Cluster grouping related content
 */
export interface ConceptCluster {
  id: string;
  name: string;
  contentIds: string[];
  centralTopics: Topic[];
  coherenceScore: number;
  size: number;
}

/**
 * Entity extracted from content
 */
export interface Entity {
  name: string;
  type: EntityType;
  confidence: number;
  mentions: number;
  context: string[];
  linkedData?: string; // URI or identifier
}

/**
 * Temporal relationship between content
 */
export interface TemporalRelation {
  sourceId: string;
  targetId: string;
  relationType: TemporalRelationType;
  timeDistance: number; // in days
  confidence: number;
}

/**
 * Content recommendation
 */
export interface ContentRecommendation {
  contentId: string;
  relevanceScore: number;
  reasonType: RecommendationReason;
  explanation: string;
  topics: string[];
}

// Enums and types
export enum RelationshipType {
  SIMILAR = 'similar',
  RELATED = 'related',
  DEPENDENCY = 'dependency',
  CONTRADICTION = 'contradiction',
  EXTENSION = 'extension',
  EXAMPLE = 'example',
  IMPLEMENTATION = 'implementation',
  REFERENCE = 'reference',
}

export enum TopicCategory {
  TECHNOLOGY = 'technology',
  METHODOLOGY = 'methodology',
  DOMAIN = 'domain',
  CONCEPT = 'concept',
  TOOL = 'tool',
  PATTERN = 'pattern',
  PRINCIPLE = 'principle',
}

export enum NodeType {
  DOCUMENT = 'document',
  CONCEPT = 'concept',
  ENTITY = 'entity',
  TOPIC = 'topic',
  CLUSTER = 'cluster',
}

export enum EntityType {
  PERSON = 'person',
  ORGANIZATION = 'organization',
  LOCATION = 'location',
  TECHNOLOGY = 'technology',
  CONCEPT = 'concept',
  PRODUCT = 'product',
  EVENT = 'event',
}

export enum TemporalRelationType {
  PRECEDES = 'precedes',
  FOLLOWS = 'follows',
  CONCURRENT = 'concurrent',
  UPDATES = 'updates',
  SUPERSEDES = 'supersedes',
}

export enum RecommendationReason {
  TOPIC_SIMILARITY = 'topic_similarity',
  ENTITY_OVERLAP = 'entity_overlap',
  SEMANTIC_SIMILARITY = 'semantic_similarity',
  TEMPORAL_RELEVANCE = 'temporal_relevance',
  CITATION_NETWORK = 'citation_network',
}

// Metadata interfaces
export interface LinkMetadata {
  createdAt: Date;
  algorithm: string;
  parameters: Record<string, unknown>;
  manual?: boolean;
}

export interface GraphMetadata {
  createdAt: Date;
  version: string;
  algorithm: string;
  parameters: Record<string, unknown>;
  contentTypes: string[];
}

export interface GraphStatistics {
  nodeCount: number;
  edgeCount: number;
  density: number;
  averageClusteringCoefficient: number;
  averagePathLength: number;
  components: number;
}

export interface NodeMetadata {
  createdAt: Date;
  lastUpdated: Date;
  source: string;
  contentType: string;
  language?: string;
}

export interface EdgeMetadata {
  createdAt: Date;
  algorithm: string;
  features: string[];
  validated?: boolean;
}
