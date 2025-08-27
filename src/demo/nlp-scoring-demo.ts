/**
 * NLP-Enhanced Content Relevance Scoring Demo
 *
 * Demonstrates the generic, domain-agnostic content relevance scoring
 * using professional NLP libraries and algorithms
 */

import { ContentRelevanceScorer } from '@/core/content-relevance-scorer.ts';
import { DiscoveredContent, ContentSource } from '@/types/index.ts';
import { logger } from '@/utils/logger.ts';

/**
 * Demo content from various domains to show generic applicability
 */
const DEMO_CONTENT: DiscoveredContent[] = [
  {
    id: 'cooking-1',
    title: 'Italian Pasta Making Techniques',
    content:
      'Master the art of making fresh pasta from scratch. Learn about different flour types, kneading techniques, and traditional Italian methods passed down through generations.',
    source: ContentSource.WEB,
    url: 'https://example.com/pasta-making',
    metadata: { publishDate: new Date('2024-02-01'), viewCount: 2500 },
    relevanceScore: 0,
    tags: ['cooking', 'italian', 'pasta', 'traditional'],
  },
  {
    id: 'gardening-1',
    title: 'Organic Vegetable Gardening for Beginners',
    content:
      'Grow your own vegetables using organic methods. This guide covers soil preparation, companion planting, natural pest control, and seasonal gardening tips.',
    source: ContentSource.TUTORIAL,
    url: 'https://example.com/organic-gardening',
    metadata: { publishDate: new Date('2024-01-20'), score: 85 },
    relevanceScore: 0,
    tags: ['gardening', 'organic', 'vegetables', 'beginners'],
  },
  {
    id: 'fitness-1',
    title: 'High-Intensity Interval Training Benefits',
    content:
      'Discover the science behind HIIT workouts. Learn about cardiovascular benefits, time efficiency, and how to design effective interval training programs.',
    source: ContentSource.ACADEMIC_PAPER,
    url: 'https://example.com/hiit-research',
    metadata: { publishDate: new Date('2024-03-10'), citations: 45 },
    relevanceScore: 0,
    tags: ['fitness', 'hiit', 'cardio', 'training'],
  },
  {
    id: 'photography-1',
    title: 'Portrait Photography Lighting Techniques',
    content:
      'Master portrait lighting with professional techniques. Explore natural light, studio setups, and creative lighting patterns for stunning portraits.',
    source: ContentSource.YOUTUBE,
    url: 'https://example.com/portrait-lighting',
    metadata: { publishDate: new Date('2024-02-15'), viewCount: 12000 },
    relevanceScore: 0,
    tags: ['photography', 'portraits', 'lighting', 'techniques'],
  },
  {
    id: 'finance-1',
    title: 'Investment Portfolio Diversification Strategies',
    content:
      'Build a resilient investment portfolio through strategic diversification. Learn about asset allocation, risk management, and long-term wealth building.',
    source: ContentSource.TECH_BLOG,
    url: 'https://example.com/portfolio-diversification',
    metadata: { publishDate: new Date('2024-01-05'), score: 92 },
    relevanceScore: 0,
    tags: ['finance', 'investing', 'portfolio', 'diversification'],
  },
];

/**
 * Test queries from different domains
 */
const TEST_QUERIES = [
  'homemade pasta recipes',
  'growing vegetables organically',
  'effective workout routines',
  'professional photography tips',
  'investment strategies for beginners',
  'Italian cooking methods',
  'sustainable agriculture practices',
  'fitness and health improvement',
  'camera techniques and composition',
  'financial planning and wealth building',
];

/**
 * Run the NLP scoring demonstration
 */
async function runNLPScoringDemo(): Promise<void> {
  logger.debug('🧠 NLP-Enhanced Content Relevance Scoring Demo');
  logger.debug('='.repeat(60));

  const scorer = new ContentRelevanceScorer();

  // Test each query against all content
  for (const query of TEST_QUERIES) {
    logger.debug(`\n🔍 Query: "${query}"`);
    logger.debug('-'.repeat(40));

    // Score and sort content for this query
    const scoredContent = await scorer.scoreAndSort(DEMO_CONTENT, query);

    // Show top 3 results
    for (let i = 0; i < Math.min(3, scoredContent.length); i++) {
      const content = scoredContent[i];
      logger.debug(`${i + 1}. ${content.title}`);
      logger.debug(`   Score: ${content.relevanceScore.toFixed(3)} | Source: ${content.source}`);
      logger.debug(`   Tags: ${content.tags.join(', ')}`);

      // Show relevance breakdown for top result
      if (i === 0) {
        const breakdown = await scorer.getRelevanceBreakdown(content, query);
        logger.debug(
          `   📊 Breakdown: Title(${breakdown.titleMatch.toFixed(2)}) Content(${breakdown.contentMatch.toFixed(2)}) Quality(${breakdown.contentQuality.toFixed(2)})`
        );
      }
    }
  }

  // Demonstrate semantic similarity detection
  logger.debug('\n🔗 Semantic Similarity Examples');
  logger.debug('='.repeat(60));

  const semanticPairs = [
    ['pasta making', 'Italian cooking methods'],
    ['organic gardening', 'sustainable agriculture'],
    ['HIIT workouts', 'fitness routines'],
    ['portrait lighting', 'photography techniques'],
    ['investment strategies', 'financial planning'],
  ];

  for (const [query1, query2] of semanticPairs) {
    const results1 = await scorer.scoreAndSort(DEMO_CONTENT, query1);
    const results2 = await scorer.scoreAndSort(DEMO_CONTENT, query2);

    logger.debug(`\n"${query1}" vs "${query2}"`);
    logger.debug(
      `Top result for both: ${results1[0].title === results2[0].title ? '✅ Same' : '❌ Different'}`
    );
    logger.debug(
      `Scores: ${results1[0].relevanceScore.toFixed(3)} vs ${results2[0].relevanceScore.toFixed(3)}`
    );
  }

  logger.debug('\n✅ NLP Scoring Demo completed!');
  logger.debug('📚 Key Features Demonstrated:');
  logger.debug('   • Domain-agnostic relevance scoring');
  logger.debug('   • Semantic similarity detection');
  logger.debug('   • Professional NLP libraries integration');
  logger.debug('   • TF-IDF and concept-based matching');
  logger.debug('   • Quality assessment with sentiment analysis');
}

// Run the demo
if (import.meta.main) {
  runNLPScoringDemo()
    .then(() => {
      logger.debug('🎯 Demo completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      logger.error('❌ Demo failed:', error);
      process.exit(1);
    });
}

export { runNLPScoringDemo };
