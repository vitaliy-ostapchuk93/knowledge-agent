/**
 * Event Bus Interface
 * Provides event-driven communication capabilities
 */

import { Event } from '@/types';

export interface IEventBus {
  /**
   * Publish an event to subscribers
   */
  publish(event: Event): void;

  /**
   * Subscribe to events of a specific type
   */
  subscribe<T>(eventType: string, handler: (data: T) => void): string;

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void;

  /**
   * Subscribe to events with pattern matching
   */
  subscribePattern(pattern: RegExp, handler: (event: Event) => void): string;

  /**
   * Get event history for debugging
   */
  getEventHistory(limit?: number): Event[];

  /**
   * Clear event history
   */
  clearHistory(): void;

  /**
   * Clear all subscriptions
   */
  clearSubscriptions(): void;
}
