import { describe, it, expect } from 'vitest';
import { generateSessionId } from '../generateSessionId';

describe('generateSessionId', () => {
  it('should return a valid UUID v4 format string', () => {
    const id = generateSessionId();
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    expect(id).toMatch(uuidV4Regex);
  });

  it('should always have "4" as the version digit', () => {
    for (let i = 0; i < 20; i++) {
      const id = generateSessionId();
      expect(id[14]).toBe('4');
    }
  });

  it('should always have valid variant bits (8, 9, a, or b)', () => {
    for (let i = 0; i < 20; i++) {
      const id = generateSessionId();
      expect(['8', '9', 'a', 'b']).toContain(id[19]);
    }
  });

  it('should generate unique IDs (no duplicates in 100 generations)', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateSessionId());
    }
    expect(ids.size).toBe(100);
  });

  it('should return a string of length 36', () => {
    const id = generateSessionId();
    expect(id.length).toBe(36);
  });
});
