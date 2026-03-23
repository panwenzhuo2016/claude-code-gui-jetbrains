import { describe, it, expect } from 'vitest';
import { toTitle } from '../sessionTransformer';

describe('sessionTransformer', () => {
  describe('toTitle()', () => {
    it('should return "No title" for undefined input', () => {
      expect(toTitle(undefined)).toBe('No title');
    });

    it('should return "No title" for empty string', () => {
      expect(toTitle('')).toBe('No title');
    });

    it('should return the text as-is when short enough', () => {
      expect(toTitle('Hello world')).toBe('Hello world');
    });

    it('should truncate text to 50 characters', () => {
      const longText = 'A'.repeat(100);
      const result = toTitle(longText);
      expect(result.length).toBe(50);
    });

    it('should strip system tags from content', () => {
      // parseUserContent strips <system-reminder> tags
      const result = toTitle('<system-reminder>hidden</system-reminder>Visible text');
      expect(result).not.toContain('system-reminder');
      expect(result).toContain('Visible');
    });
  });
});
