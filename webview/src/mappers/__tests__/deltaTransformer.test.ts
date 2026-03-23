import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { transformDelta } from '../deltaTransformer';
import { TextDeltaDto, ToolUseDeltaDto } from '../../dto/stream/StreamEventDto';

describe('deltaTransformer', () => {
  describe('transformDelta()', () => {
    it('should return undefined for null input', () => {
      expect(transformDelta(null)).toBeUndefined();
    });

    it('should return undefined for undefined input', () => {
      expect(transformDelta(undefined)).toBeUndefined();
    });

    it('should return undefined for non-object input', () => {
      expect(transformDelta('string')).toBeUndefined();
      expect(transformDelta(42)).toBeUndefined();
    });

    it('should transform text_delta to TextDeltaDto', () => {
      const result = transformDelta({ type: 'text_delta', text: 'Hello world' });
      expect(result).toBeInstanceOf(TextDeltaDto);
      expect(result!.type).toBe('text_delta');
      expect((result as TextDeltaDto).text).toBe('Hello world');
    });

    it('should transform tool_use_delta to ToolUseDeltaDto', () => {
      const result = transformDelta({
        type: 'tool_use_delta',
        id: 'tool_1',
        name: 'bash',
        input: { command: 'ls' },
      });
      expect(result).toBeInstanceOf(ToolUseDeltaDto);
      expect(result!.type).toBe('tool_use_delta');
    });

    it('should transform input_json_delta to ToolUseDeltaDto', () => {
      const result = transformDelta({
        type: 'input_json_delta',
        id: 'tool_2',
      });
      expect(result).toBeInstanceOf(ToolUseDeltaDto);
    });

    it('should infer TextDeltaDto from object with text field (unknown type)', () => {
      const result = transformDelta({ text: 'inferred text' });
      expect(result).toBeInstanceOf(TextDeltaDto);
      expect((result as TextDeltaDto).text).toBe('inferred text');
    });

    it('should infer ToolUseDeltaDto from object with id field (unknown type)', () => {
      const result = transformDelta({ id: 'tool_3' });
      expect(result).toBeInstanceOf(ToolUseDeltaDto);
    });

    it('should infer ToolUseDeltaDto from object with name field (unknown type)', () => {
      const result = transformDelta({ name: 'bash' });
      expect(result).toBeInstanceOf(ToolUseDeltaDto);
    });

    it('should infer ToolUseDeltaDto from object with input field (unknown type)', () => {
      const result = transformDelta({ input: { cmd: 'test' } });
      expect(result).toBeInstanceOf(ToolUseDeltaDto);
    });

    it('should return undefined for unknown delta with no recognizable fields', () => {
      const result = transformDelta({ type: 'unknown', foo: 'bar' });
      expect(result).toBeUndefined();
    });
  });
});
