import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fs/promises before importing the module
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

import { readFile } from 'fs/promises';
import { extractSessionInfo } from '../extractSessionInfo';

const mockReadFile = vi.mocked(readFile);

describe('extractSessionInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractSessionInfo()', () => {
    it('should extract title from summary entry', async () => {
      const jsonl = [
        JSON.stringify({
          uuid: 'u1',
          parentUuid: null,
          type: 'user',
          timestamp: '2025-01-01T00:00:00Z',
          message: { content: [{ type: 'text', text: 'Hello world' }] },
        }),
        JSON.stringify({
          uuid: 'u2',
          parentUuid: 'u1',
          type: 'assistant',
          timestamp: '2025-01-01T00:01:00Z',
          message: { content: [{ type: 'text', text: 'Hi there' }] },
        }),
        JSON.stringify({
          type: 'summary',
          leafUuid: 'u2',
          summary: 'Greeting conversation',
        }),
      ].join('\n');

      mockReadFile.mockResolvedValue(jsonl);
      const result = await extractSessionInfo('/fake/session.jsonl');

      expect(result.title).toBe('Greeting conversation');
      expect(result.messageCount).toBe(3);
      expect(result.isSidechain).toBe(false);
      expect(result.createdAt).toBe('2025-01-01T00:00:00Z');
    });

    it('should use first user prompt as title when no summary exists', async () => {
      const jsonl = [
        JSON.stringify({
          uuid: 'u1',
          parentUuid: null,
          type: 'user',
          timestamp: '2025-01-01T00:00:00Z',
          message: { content: [{ type: 'text', text: 'Build me a React app' }] },
        }),
        JSON.stringify({
          uuid: 'u2',
          parentUuid: 'u1',
          type: 'assistant',
          timestamp: '2025-01-01T00:01:00Z',
          message: { content: [{ type: 'text', text: 'Sure!' }] },
        }),
      ].join('\n');

      mockReadFile.mockResolvedValue(jsonl);
      const result = await extractSessionInfo('/fake/session.jsonl');

      expect(result.title).toBe('Build me a React app');
    });

    it('should return "No title" when no summary or user prompt exists', async () => {
      const jsonl = [
        JSON.stringify({
          uuid: 'u1',
          parentUuid: null,
          type: 'assistant',
          timestamp: '2025-01-01T00:00:00Z',
          message: { content: [{ type: 'text', text: 'Hello' }] },
        }),
      ].join('\n');

      mockReadFile.mockResolvedValue(jsonl);
      const result = await extractSessionInfo('/fake/session.jsonl');

      expect(result.title).toBe('No title');
    });

    it('should detect sidechain session from first message', async () => {
      const jsonl = [
        JSON.stringify({
          uuid: 'u1',
          parentUuid: null,
          type: 'user',
          timestamp: '2025-01-01T00:00:00Z',
          isSidechain: true,
          message: { content: 'test' },
        }),
      ].join('\n');

      mockReadFile.mockResolvedValue(jsonl);
      const result = await extractSessionInfo('/fake/session.jsonl');

      expect(result.isSidechain).toBe(true);
      expect(result.title).toBe('Sidechain Session');
    });

    it('should return "Empty Session" when no user or assistant messages exist', async () => {
      const jsonl = [
        JSON.stringify({
          uuid: 'u1',
          parentUuid: null,
          type: 'system',
          timestamp: '2025-01-01T00:00:00Z',
          message: { content: 'init' },
        }),
      ].join('\n');

      mockReadFile.mockResolvedValue(jsonl);
      const result = await extractSessionInfo('/fake/session.jsonl');

      expect(result.title).toBe('Empty Session');
      expect(result.isSidechain).toBe(true);
    });

    it('should extract lastTimestamp from the latest message', async () => {
      const jsonl = [
        JSON.stringify({
          uuid: 'u1',
          parentUuid: null,
          type: 'user',
          timestamp: '2025-01-01T00:00:00Z',
          message: { content: [{ type: 'text', text: 'Hi' }] },
        }),
        JSON.stringify({
          uuid: 'u2',
          parentUuid: 'u1',
          type: 'assistant',
          timestamp: '2025-01-01T12:00:00Z',
          message: { content: [{ type: 'text', text: 'Hello' }] },
        }),
        JSON.stringify({
          uuid: 'u3',
          parentUuid: 'u2',
          type: 'user',
          timestamp: '2025-01-02T00:00:00Z',
          message: { content: [{ type: 'text', text: 'Bye' }] },
        }),
      ].join('\n');

      mockReadFile.mockResolvedValue(jsonl);
      const result = await extractSessionInfo('/fake/session.jsonl');

      expect(result.lastTimestamp).toBe('2025-01-02T00:00:00Z');
      expect(result.createdAt).toBe('2025-01-01T00:00:00Z');
    });

    it('should skip malformed JSON lines gracefully', async () => {
      const jsonl = [
        'not valid json',
        JSON.stringify({
          uuid: 'u1',
          parentUuid: null,
          type: 'user',
          timestamp: '2025-01-01T00:00:00Z',
          message: { content: [{ type: 'text', text: 'Hello' }] },
        }),
        '{"broken',
        JSON.stringify({
          uuid: 'u2',
          parentUuid: 'u1',
          type: 'assistant',
          timestamp: '2025-01-01T00:01:00Z',
          message: { content: [{ type: 'text', text: 'Hi' }] },
        }),
      ].join('\n');

      mockReadFile.mockResolvedValue(jsonl);
      const result = await extractSessionInfo('/fake/session.jsonl');

      expect(result.title).toBe('Hello');
      expect(result.messageCount).toBe(2); // only valid lines counted
    });

    it('should handle string content in messages', async () => {
      const jsonl = [
        JSON.stringify({
          uuid: 'u1',
          parentUuid: null,
          type: 'user',
          timestamp: '2025-01-01T00:00:00Z',
          message: { content: 'Plain string content' },
        }),
        JSON.stringify({
          uuid: 'u2',
          parentUuid: 'u1',
          type: 'assistant',
          timestamp: '2025-01-01T00:01:00Z',
          message: { content: [{ type: 'text', text: 'Response' }] },
        }),
      ].join('\n');

      mockReadFile.mockResolvedValue(jsonl);
      const result = await extractSessionInfo('/fake/session.jsonl');

      expect(result.title).toBe('Plain string content');
    });

    it('should remove system tags from user prompt title', async () => {
      const jsonl = [
        JSON.stringify({
          uuid: 'u1',
          parentUuid: null,
          type: 'user',
          timestamp: '2025-01-01T00:00:00Z',
          message: {
            content: [
              {
                type: 'text',
                text: '<system-tag>hidden</system-tag>Build a web app',
              },
            ],
          },
        }),
        JSON.stringify({
          uuid: 'u2',
          parentUuid: 'u1',
          type: 'assistant',
          timestamp: '2025-01-01T00:01:00Z',
          message: { content: [{ type: 'text', text: 'Sure' }] },
        }),
      ].join('\n');

      mockReadFile.mockResolvedValue(jsonl);
      const result = await extractSessionInfo('/fake/session.jsonl');

      expect(result.title).toBe('Build a web app');
    });

    it('should skip isMeta user messages for title extraction', async () => {
      const jsonl = [
        JSON.stringify({
          uuid: 'u1',
          parentUuid: null,
          type: 'user',
          isMeta: true,
          timestamp: '2025-01-01T00:00:00Z',
          message: { content: [{ type: 'text', text: 'Meta message' }] },
        }),
        JSON.stringify({
          uuid: 'u2',
          parentUuid: 'u1',
          type: 'user',
          timestamp: '2025-01-01T00:01:00Z',
          message: { content: [{ type: 'text', text: 'Real user message' }] },
        }),
        JSON.stringify({
          uuid: 'u3',
          parentUuid: 'u2',
          type: 'assistant',
          timestamp: '2025-01-01T00:02:00Z',
          message: { content: [{ type: 'text', text: 'Response' }] },
        }),
      ].join('\n');

      mockReadFile.mockResolvedValue(jsonl);
      const result = await extractSessionInfo('/fake/session.jsonl');

      expect(result.title).toBe('Real user message');
    });

    it('should handle empty lines', async () => {
      const jsonl = [
        '',
        JSON.stringify({
          uuid: 'u1',
          parentUuid: null,
          type: 'user',
          timestamp: '2025-01-01T00:00:00Z',
          message: { content: [{ type: 'text', text: 'Hi' }] },
        }),
        '',
        JSON.stringify({
          uuid: 'u2',
          parentUuid: 'u1',
          type: 'assistant',
          timestamp: '2025-01-01T00:01:00Z',
          message: { content: [{ type: 'text', text: 'Hello' }] },
        }),
      ].join('\n');

      mockReadFile.mockResolvedValue(jsonl);
      const result = await extractSessionInfo('/fake/session.jsonl');

      expect(result.title).toBe('Hi');
      expect(result.messageCount).toBe(2);
    });

    it('should use last text block from content array for title', async () => {
      const jsonl = [
        JSON.stringify({
          uuid: 'u1',
          parentUuid: null,
          type: 'user',
          timestamp: '2025-01-01T00:00:00Z',
          message: {
            content: [
              { type: 'image', data: 'base64data' },
              { type: 'text', text: 'First text' },
              { type: 'text', text: 'Second text' },
            ],
          },
        }),
        JSON.stringify({
          uuid: 'u2',
          parentUuid: 'u1',
          type: 'assistant',
          timestamp: '2025-01-01T00:01:00Z',
          message: { content: [{ type: 'text', text: 'Response' }] },
        }),
      ].join('\n');

      mockReadFile.mockResolvedValue(jsonl);
      const result = await extractSessionInfo('/fake/session.jsonl');

      expect(result.title).toBe('Second text');
    });
  });
});
