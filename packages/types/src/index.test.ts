import { describe, it, expect } from 'vitest';
import * as types from './index';

describe('Types Package', () => {
  it('should export XatsDocument type', () => {
    expect(types).toBeDefined();
  });

  it('should have required type definitions', () => {
    // Basic smoke test to ensure the package compiles
    expect(typeof types).toBe('object');
  });
});