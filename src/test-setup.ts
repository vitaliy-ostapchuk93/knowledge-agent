// Test setup for Bun
import { beforeAll, afterAll } from 'bun:test';

// Global test setup
beforeAll(() => {
  console.log('Setting up tests...');
});

afterAll(() => {
  console.log('Cleaning up tests...');
});

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
