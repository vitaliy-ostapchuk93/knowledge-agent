/**
 * Knowledge Integration Interface
 * Handles integrating processed knowledge into target platforms
 */

import { Summary, PlatformType } from '@/types';

/**
 * Interface for integrating knowledge into target platforms
 */
export interface IKnowledgeIntegrator {
  /**
   * Integrate summary into specified platform
   */
  integrate(summary: Summary, targetPlatform: PlatformType): Promise<string>;

  /**
   * Get supported platforms
   */
  getSupportedPlatforms(): PlatformType[];

  /**
   * Check if platform is available and configured
   */
  isPlatformAvailable(platform: PlatformType): Promise<boolean>;
}
