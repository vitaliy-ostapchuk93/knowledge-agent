import { describe, it, expect } from 'bun:test';

describe('Knowledge Agent', () => {
  it('should be able to run basic tests', () => {
    expect(true).toBe(true);
  });

  it('should have access to environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
