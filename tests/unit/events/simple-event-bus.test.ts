/**
 * SimpleEventBus Tests
 * Tests for the event bus implementation
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { SimpleEventBus } from '@/events/simple-event-bus.ts';
import { Event } from '@/types/index.ts';

describe('SimpleEventBus', () => {
  let eventBus: SimpleEventBus;

  beforeEach(() => {
    eventBus = new SimpleEventBus();
  });

  describe('Event Subscription and Publishing', () => {
    it('should subscribe to events and receive published events', () => {
      let receivedData: unknown = null;

      eventBus.subscribe('test-event', data => {
        receivedData = data;
      });

      const event: Event = {
        type: 'test-event',
        data: { message: 'Hello World' },
        timestamp: new Date(),
        source: 'test',
      };

      eventBus.publish(event);

      expect(receivedData).toEqual({ message: 'Hello World' });
    });

    it('should support multiple subscribers for the same event', () => {
      const receivedData: Array<{ subscriber: number; data: unknown }> = [];

      eventBus.subscribe('multi-event', data => receivedData.push({ subscriber: 1, data }));
      eventBus.subscribe('multi-event', data => receivedData.push({ subscriber: 2, data }));

      const event: Event = {
        type: 'multi-event',
        data: { test: 'data' },
        timestamp: new Date(),
        source: 'test',
      };

      eventBus.publish(event);

      expect(receivedData).toHaveLength(2);
      expect(receivedData[0]).toEqual({ subscriber: 1, data: { test: 'data' } });
      expect(receivedData[1]).toEqual({ subscriber: 2, data: { test: 'data' } });
    });

    it('should not affect other events when publishing', () => {
      let event1Data: unknown = null;
      let event2Data: unknown = null;

      eventBus.subscribe('event1', data => {
        event1Data = data;
      });
      eventBus.subscribe('event2', data => {
        event2Data = data;
      });

      const event: Event = {
        type: 'event1',
        data: { message: 'Event 1' },
        timestamp: new Date(),
        source: 'test',
      };

      eventBus.publish(event);

      expect(event1Data).toEqual({ message: 'Event 1' });
      expect(event2Data).toBeNull();
    });
  });

  describe('Unsubscription', () => {
    it('should unsubscribe from events using subscription ID', () => {
      let callCount = 0;

      const subscriptionId = eventBus.subscribe('unsubscribe-test', () => {
        callCount++;
      });

      const event: Event = {
        type: 'unsubscribe-test',
        data: {},
        timestamp: new Date(),
        source: 'test',
      };

      eventBus.publish(event);
      expect(callCount).toBe(1);

      eventBus.unsubscribe(subscriptionId);
      eventBus.publish(event);
      expect(callCount).toBe(1); // Should not increment
    });

    it('should handle unsubscribing non-existent subscription IDs gracefully', () => {
      // Should not throw error
      expect(() => {
        eventBus.unsubscribe('non-existent-id');
      }).not.toThrow();
    });

    it('should only unsubscribe the specific subscription', () => {
      let callback1Called = false;
      let callback2Called = false;

      const sub1 = eventBus.subscribe('selective-unsubscribe', () => {
        callback1Called = true;
      });
      eventBus.subscribe('selective-unsubscribe', () => {
        callback2Called = true;
      });

      eventBus.unsubscribe(sub1);

      const event: Event = {
        type: 'selective-unsubscribe',
        data: {},
        timestamp: new Date(),
        source: 'test',
      };

      eventBus.publish(event);

      expect(callback1Called).toBe(false);
      expect(callback2Called).toBe(true);
    });
  });

  describe('Pattern-based Subscriptions', () => {
    it('should support pattern-based subscriptions', () => {
      const receivedEvents: Event[] = [];

      eventBus.subscribePattern(/^user\./, event => {
        receivedEvents.push(event);
      });

      const event1: Event = {
        type: 'user.created',
        data: { userId: 1 },
        timestamp: new Date(),
        source: 'test',
      };

      const event2: Event = {
        type: 'user.updated',
        data: { userId: 1 },
        timestamp: new Date(),
        source: 'test',
      };

      const event3: Event = {
        type: 'order.created',
        data: { orderId: 1 },
        timestamp: new Date(),
        source: 'test',
      };

      eventBus.publish(event1);
      eventBus.publish(event2);
      eventBus.publish(event3);

      expect(receivedEvents).toHaveLength(2);
      expect(receivedEvents[0].type).toBe('user.created');
      expect(receivedEvents[1].type).toBe('user.updated');
    });
  });

  describe('Event History', () => {
    it('should maintain event history', () => {
      const event1: Event = {
        type: 'history-test-1',
        data: { value: 1 },
        timestamp: new Date(),
        source: 'test',
      };

      const event2: Event = {
        type: 'history-test-2',
        data: { value: 2 },
        timestamp: new Date(),
        source: 'test',
      };

      eventBus.publish(event1);
      eventBus.publish(event2);

      const history = eventBus.getEventHistory();
      expect(history).toHaveLength(2);
      expect(history[0].type).toBe('history-test-1');
      expect(history[1].type).toBe('history-test-2');
    });

    it('should limit history size', () => {
      const limitedEventBus = new SimpleEventBus(2);

      for (let i = 0; i < 5; i++) {
        const event: Event = {
          type: 'history-limit-test',
          data: { count: i },
          timestamp: new Date(),
          source: 'test',
        };
        limitedEventBus.publish(event);
      }

      const history = limitedEventBus.getEventHistory();
      expect(history).toHaveLength(2);
      expect((history[0].data as { count: number }).count).toBe(3);
      expect((history[1].data as { count: number }).count).toBe(4);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in callbacks gracefully', () => {
      let successCallbackCalled = false;
      
      // Suppress console errors during test
      const originalConsoleError = console.error;
      console.error = () => {}; // Mock console.error
      
      eventBus.subscribe('error-handling', () => {
        throw new Error('Callback error');
      });

      eventBus.subscribe('error-handling', () => {
        successCallbackCalled = true;
      });

      const event: Event = {
        type: 'error-handling',
        data: {},
        timestamp: new Date(),
        source: 'test',
      };

      // Should not throw and should continue with other callbacks
      expect(() => {
        eventBus.publish(event);
      }).not.toThrow();

      expect(successCallbackCalled).toBe(true);
      
      // Restore console.error
      console.error = originalConsoleError;
    });

    it('should handle publishing events with no subscribers gracefully', () => {
      const event: Event = {
        type: 'no-subscribers',
        data: { test: 'data' },
        timestamp: new Date(),
        source: 'test',
      };

      expect(() => {
        eventBus.publish(event);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of subscribers efficiently', () => {
      let totalCalls = 0;

      // Create 100 subscribers
      for (let i = 0; i < 100; i++) {
        eventBus.subscribe('performance-test', () => {
          totalCalls++;
        });
      }

      const event: Event = {
        type: 'performance-test',
        data: { test: 'data' },
        timestamp: new Date(),
        source: 'test',
      };

      const startTime = Date.now();
      eventBus.publish(event);
      const endTime = Date.now();

      expect(totalCalls).toBe(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it('should handle rapid event publishing', () => {
      const receivedEvents: unknown[] = [];

      eventBus.subscribe('rapid-events', data => receivedEvents.push(data));

      // Publish multiple events rapidly
      for (let i = 0; i < 10; i++) {
        const event: Event = {
          type: 'rapid-events',
          data: { count: i },
          timestamp: new Date(),
          source: 'test',
        };
        eventBus.publish(event);
      }

      expect(receivedEvents).toHaveLength(10);
      expect(receivedEvents[0]).toEqual({ count: 0 });
      expect(receivedEvents[9]).toEqual({ count: 9 });
    });
  });

  describe('Event Bus Management', () => {
    it('should provide statistics about the event bus', () => {
      eventBus.subscribe('test-event', () => {
        /* test handler */
      });
      eventBus.subscribe('another-event', () => {
        /* test handler */
      });

      const event1: Event = {
        type: 'test-event',
        data: {},
        timestamp: new Date(),
        source: 'test',
      };

      const event2: Event = {
        type: 'another-event',
        data: {},
        timestamp: new Date(),
        source: 'test',
      };

      eventBus.publish(event1);
      eventBus.publish(event2);

      const stats = eventBus.getStats();
      expect(stats.subscriptions).toBe(2);
      expect(stats.historySize).toBe(2);
      expect(stats.eventTypes).toContain('test-event');
      expect(stats.eventTypes).toContain('another-event');
    });

    it('should clear all subscriptions', () => {
      let callCount = 0;
      eventBus.subscribe('clear-test', () => {
        callCount++;
      });
      eventBus.subscribe('clear-test', () => {
        callCount++;
      });

      const event: Event = {
        type: 'clear-test',
        data: {},
        timestamp: new Date(),
        source: 'test',
      };

      eventBus.publish(event);
      expect(callCount).toBe(2);

      eventBus.clearSubscriptions();
      callCount = 0;
      eventBus.publish(event);
      expect(callCount).toBe(0);
    });

    it('should clear event history', () => {
      const event: Event = {
        type: 'history-clear-test',
        data: {},
        timestamp: new Date(),
        source: 'test',
      };

      eventBus.publish(event);
      expect(eventBus.getEventHistory()).toHaveLength(1);

      eventBus.clearHistory();
      expect(eventBus.getEventHistory()).toHaveLength(0);
    });

    it('should destroy and clean up properly', () => {
      eventBus.subscribe('destroy-test', () => {
        /* test handler */
      });
      const event: Event = {
        type: 'destroy-test',
        data: {},
        timestamp: new Date(),
        source: 'test',
      };
      eventBus.publish(event);

      expect(eventBus.getStats().subscriptions).toBeGreaterThan(0);
      expect(eventBus.getEventHistory()).toHaveLength(1);

      eventBus.destroy();

      expect(eventBus.getStats().subscriptions).toBe(0);
      expect(eventBus.getEventHistory()).toHaveLength(0);
    });

    it('should get current subscriptions for debugging', () => {
      const sub1 = eventBus.subscribe('debug-test-1', () => {
        /* test handler */
      });
      const sub2 = eventBus.subscribePattern(/^debug\./, () => {
        /* test handler */
      });

      const subscriptions = eventBus.getSubscriptions();
      expect(subscriptions).toHaveLength(2);

      const normalSub = subscriptions.find(s => s.eventType === 'debug-test-1');
      const patternSub = subscriptions.find(s => s.pattern?.source === '^debug\\.');

      expect(normalSub).toBeDefined();
      expect(patternSub).toBeDefined();
      expect(normalSub?.id).toBe(sub1);
      expect(patternSub?.id).toBe(sub2);
    });
  });
});
