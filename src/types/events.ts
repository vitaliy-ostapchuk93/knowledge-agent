/**
 * Event System Types
 * Types for the event-driven architecture
 */

export interface Event {
  type: string;
  data: unknown;
  timestamp: Date;
  source: string;
}
