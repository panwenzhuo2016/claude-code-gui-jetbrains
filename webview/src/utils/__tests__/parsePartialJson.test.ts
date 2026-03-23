import { describe, it, expect } from 'vitest';
import { parsePartialJson } from '../parsePartialJson';

describe('parsePartialJson', () => {
  describe('complete JSON', () => {
    it('should parse a complete JSON object', () => {
      expect(parsePartialJson('{"key":"value"}')).toEqual({ key: 'value' });
    });

    it('should parse nested objects', () => {
      expect(parsePartialJson('{"a":{"b":"c"}}')).toEqual({ a: { b: 'c' } });
    });

    it('should parse objects with arrays', () => {
      expect(parsePartialJson('{"items":[1,2,3]}')).toEqual({ items: [1, 2, 3] });
    });

    it('should return undefined for complete non-object JSON (number)', () => {
      expect(parsePartialJson('42')).toBeUndefined();
    });

    it('should return undefined for complete non-object JSON (string)', () => {
      expect(parsePartialJson('"hello"')).toBeUndefined();
    });

    it('should parse arrays as valid objects', () => {
      const result = parsePartialJson('[1, 2, 3]');
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('empty/invalid input', () => {
    it('should return undefined for empty string', () => {
      expect(parsePartialJson('')).toBeUndefined();
    });

    it('should return undefined for whitespace-only string', () => {
      expect(parsePartialJson('   ')).toBeUndefined();
    });

    it('should return undefined for completely invalid input', () => {
      expect(parsePartialJson('not json at all')).toBeUndefined();
    });
  });

  describe('truncated strings', () => {
    it('should repair a truncated string value', () => {
      const result = parsePartialJson('{"key":"val');
      expect(result).toEqual({ key: 'val' });
    });

    it('should repair a truncated string with escape sequence', () => {
      // Trailing backslash inside string: escape flag is set, closing quote added
      // The repair may or may not produce a valid parse depending on the escape char
      const result = parsePartialJson('{"key":"hello\\n');
      expect(result).toBeDefined();
      expect(result).toEqual({ key: 'hello\n' });
    });

    it('should handle truncated key-value with no value', () => {
      // {"key":  — colon with no value
      const result = parsePartialJson('{"key":');
      expect(result).toEqual({ key: null });
    });
  });

  describe('truncated objects', () => {
    it('should close unclosed object brace', () => {
      const result = parsePartialJson('{"a":"b"');
      expect(result).toEqual({ a: 'b' });
    });

    it('should handle trailing comma', () => {
      const result = parsePartialJson('{"a":"b",');
      expect(result).toEqual({ a: 'b' });
    });

    it('should handle incomplete key after comma', () => {
      // {"a":"b","ke — incomplete next key
      const result = parsePartialJson('{"a":"b","ke');
      expect(result).toEqual({ a: 'b' });
    });

    it('should handle complete key with missing value', () => {
      // {"a":"b","key": — regex ,"key":  (value missing) removes the trailing pair
      // Then :\s*$ → : null may apply. Actual behavior: the regex strips ,"key": leaving {"a":"b"}
      const result = parsePartialJson('{"a":"b","key":');
      // The regex ,\s*"key"\s*:\s*$ removes the incomplete key-value pair
      expect(result).toEqual({ a: 'b' });
    });

    it('should handle complete key with colon and space but no value', () => {
      const result = parsePartialJson('{"a":"b","key": ');
      // Same regex strips the incomplete pair
      expect(result).toEqual({ a: 'b' });
    });
  });

  describe('truncated arrays', () => {
    it('should close unclosed array bracket', () => {
      const result = parsePartialJson('{"items":[1,2');
      expect(result).toEqual({ items: [1, 2] });
    });

    it('should handle trailing comma in array', () => {
      const result = parsePartialJson('{"items":[1,2,');
      expect(result).toEqual({ items: [1, 2] });
    });
  });

  describe('nested brackets', () => {
    it('should close multiple unclosed brackets', () => {
      const result = parsePartialJson('{"a":{"b":[1,2');
      expect(result).toEqual({ a: { b: [1, 2] } });
    });

    it('should handle deeply nested incomplete structure', () => {
      const result = parsePartialJson('{"l1":{"l2":{"l3":"val"');
      expect(result).toEqual({ l1: { l2: { l3: 'val' } } });
    });
  });

  describe('real streaming scenarios', () => {
    it('should parse a streaming tool input incrementally', () => {
      const increments = [
        '{"command":',
        '{"command":"ls',
        '{"command":"ls -la"',
        '{"command":"ls -la"}',
      ];

      // First one: {"command": — trailing colon gets `: null` treatment
      const r1 = parsePartialJson(increments[0]);
      expect(r1).toEqual({ command: null }); // :\s*$ → : null

      const r2 = parsePartialJson(increments[1]);
      expect(r2).toEqual({ command: 'ls' });

      const r3 = parsePartialJson(increments[2]);
      expect(r3).toEqual({ command: 'ls -la' });

      const r4 = parsePartialJson(increments[3]);
      expect(r4).toEqual({ command: 'ls -la' });
    });
  });
});
