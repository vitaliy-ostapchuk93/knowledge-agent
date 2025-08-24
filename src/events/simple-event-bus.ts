/**
 * Simple Event Bus - MVP Implementation
 * Provides publish-subscribe functionality for loose coupling
 */

import { IEventBus } from '../interfaces/index.js';
import { Event } from '../types/index.js';

type EventHandler<T = unknown> = (data: T) => void;
type EventHandlerGeneric = (event: Event) => void;

interface ISubscription {
  id: string;
  eventType?: string;
  pattern?: RegExp;
  handler: EventHandler | EventHandlerGeneric;
}

export class SimpleEventBus implements IEventBus {
  private subscriptions: Map<string, ISubscription> = new Map();
  private eventHistory: Event[] = [];
  private maxHistorySize: number;
  private subscriptionCounter = 0;

  constructor(maxHistorySize: number = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Publish an event
   */
  publish(event: Event): void {
    // Add to history
    this.eventHistory.push(event);

    // Trim history if needed
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify subscribers
    for (const subscription of this.subscriptions.values()) {
      try {
        if (this.shouldNotify(subscription, event)) {
          if (subscription.pattern) {
            // Pattern-based subscription
            (subscription.handler as EventHandlerGeneric)(event);
          } else {
            // Type-specific subscription
            (subscription.handler as EventHandler)(event.data);
          }
        }
      } catch (error) {
        console.error(`❌ Error in event handler for ${event.type}:`, error);
      }
    }

    // Log important events
    if (this.isImportantEvent(event.type)) {
      console.log(`📢 Event: ${event.type} from ${event.source}`);
    }
  }

  /**
   * Subscribe to events of a specific type
   */
  subscribe<T>(eventType: string, handler: (data: T) => void): string {
    const subscriptionId = `sub-${++this.subscriptionCounter}`;

    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      eventType,
      handler: handler as EventHandler,
    });

    console.log(`🔔 Subscribed to ${eventType} (${subscriptionId})`);
    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      this.subscriptions.delete(subscriptionId);
      console.log(`🔕 Unsubscribed ${subscriptionId} from ${subscription.eventType || 'pattern'}`);
    }
  }

  /**
   * Subscribe to events with pattern matching
   */
  subscribePattern(pattern: RegExp, handler: (event: Event) => void): string {
    const subscriptionId = `pattern-${++this.subscriptionCounter}`;

    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      pattern,
      handler: handler as EventHandlerGeneric,
    });

    console.log(`🔔 Subscribed to pattern ${pattern.source} (${subscriptionId})`);
    return subscriptionId;
  }

  /**
   * Get event history for debugging
   */
  getEventHistory(limit?: number): Event[] {
    const events = [...this.eventHistory];
    if (limit && limit > 0) {
      return events.slice(-limit);
    }
    return events;
  }

  /**
   * Get current subscriptions (for debugging)
   */
  getSubscriptions(): ISubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Clear all subscriptions
   */
  clearSubscriptions(): void {
    const count = this.subscriptions.size;
    this.subscriptions.clear();
    console.log(`🗑️ Cleared ${count} subscriptions`);
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    const count = this.eventHistory.length;
    this.eventHistory = [];
    console.log(`🗑️ Cleared ${count} events from history`);
  }

  /**
   * Get statistics about the event bus
   */
  getStats(): {
    subscriptions: number;
    historySize: number;
    eventTypes: string[];
  } {
    const eventTypes = [...new Set(this.eventHistory.map(e => e.type))];

    return {
      subscriptions: this.subscriptions.size,
      historySize: this.eventHistory.length,
      eventTypes,
    };
  }

  /**
   * Check if a subscription should be notified for an event
   */
  private shouldNotify(subscription: ISubscription, event: Event): boolean {
    if (subscription.eventType) {
      return subscription.eventType === event.type;
    }

    if (subscription.pattern) {
      return subscription.pattern.test(event.type);
    }

    return false;
  }

  /**
   * Check if an event type is considered important for logging
   */
  private isImportantEvent(eventType: string): boolean {
    const importantEvents = [
      'agent.initialized',
      'agent.shutdown',
      'discovery.failed',
      'summarization.failed',
      'integration.failed',
      'error',
    ];

    return importantEvents.some(important => eventType.includes(important));
  }

  /**
   * Destroy the event bus and clean up
   */
  destroy(): void {
    this.clearSubscriptions();
    this.clearHistory();
  }
}
