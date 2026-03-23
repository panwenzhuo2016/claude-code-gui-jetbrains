import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { transformMessages } from '../messageTransformer';
import {
  UserMessageDto,
  AssistantMessageDto,
  SystemMessageDto,
  ResultMessageDto,
} from '../../dto/message/MessageDto';

describe('messageTransformer', () => {
  describe('transformMessages()', () => {
    it('should return empty array for null input', () => {
      expect(transformMessages(null)).toEqual([]);
    });

    it('should return empty array for undefined input', () => {
      expect(transformMessages(undefined)).toEqual([]);
    });

    it('should return empty array for non-array input', () => {
      expect(transformMessages('not an array')).toEqual([]);
      expect(transformMessages(42)).toEqual([]);
    });

    it('should return empty array for empty array input', () => {
      expect(transformMessages([])).toEqual([]);
    });

    it('should transform user message', () => {
      const messages = transformMessages([
        {
          type: 'user',
          message: { role: 'user', content: 'Hello' },
          timestamp: '2025-01-01T00:00:00Z',
        },
      ]);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toBeInstanceOf(UserMessageDto);
    });

    it('should transform assistant message', () => {
      const messages = transformMessages([
        {
          type: 'assistant',
          sessionId: 'sess1',
          messageId: 'msg1',
          content: [{ type: 'text', text: 'Hello' }],
        },
      ]);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toBeInstanceOf(AssistantMessageDto);
    });

    it('should transform system message', () => {
      const messages = transformMessages([
        {
          type: 'system',
          session_id: 'sess1',
          timestamp: '2025-01-01T00:00:00Z',
          content: 'Session started',
        },
      ]);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toBeInstanceOf(SystemMessageDto);
    });

    it('should transform result message', () => {
      const messages = transformMessages([
        {
          type: 'result',
          sessionId: 'sess1',
          status: 'success',
          messageId: 'msg1',
        },
      ]);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toBeInstanceOf(ResultMessageDto);
    });

    it('should handle unknown message type as SystemMessageDto', () => {
      const messages = transformMessages([
        { type: 'unknown_type', data: 'test' },
      ]);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toBeInstanceOf(SystemMessageDto);
    });

    it('should handle invalid message (null item) as SystemMessageDto', () => {
      const messages = transformMessages([null]);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toBeInstanceOf(SystemMessageDto);
    });

    it('should transform mixed message types', () => {
      const messages = transformMessages([
        {
          type: 'user',
          message: { role: 'user', content: 'Hi' },
          timestamp: '2025-01-01T00:00:00Z',
        },
        {
          type: 'assistant',
          sessionId: 's1',
          messageId: 'm1',
          content: [{ type: 'text', text: 'Hello' }],
        },
        {
          type: 'result',
          sessionId: 's1',
          status: 'success',
        },
      ]);
      expect(messages).toHaveLength(3);
      expect(messages[0]).toBeInstanceOf(UserMessageDto);
      expect(messages[1]).toBeInstanceOf(AssistantMessageDto);
      expect(messages[2]).toBeInstanceOf(ResultMessageDto);
    });
  });
});
