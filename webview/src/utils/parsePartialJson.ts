/**
 * Partial JSON parser for streaming input_json_delta.
 *
 * Claude API streams tool_use input as incremental JSON fragments.
 * Standard JSON.parse() fails on incomplete strings, leaving the UI
 * with an empty object until the entire JSON is received.
 *
 * This utility repairs truncated JSON by:
 * 1. Closing unclosed string literals
 * 2. Removing trailing incomplete key-value pairs
 * 3. Closing unclosed brackets/braces
 *
 * On failure, returns undefined (caller keeps previous value).
 */
export function parsePartialJson(text: string): Record<string, unknown> | undefined {
  if (!text || !text.trim()) return undefined;

  // 1. Try normal parse first (fast path)
  try {
    const result = JSON.parse(text);
    if (typeof result === 'object' && result !== null) return result as Record<string, unknown>;
    return undefined;
  } catch {
    // continue to repair
  }

  // 2. Analyze string state and bracket depth
  let inString = false;
  let escaped = false;
  const stack: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\' && inString) { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if (ch === '}' || ch === ']') stack.pop();
  }

  let repaired = text;

  // 3. Close unclosed string literal
  if (inString) repaired += '"';

  // 4. Remove trailing incomplete tokens (outside strings)
  //    Order matters: most specific patterns first
  repaired = repaired.replace(/,\s*"(?:[^"\\]|\\.)*"\s*:\s*$/, ''); // ,"key":  (value missing)
  repaired = repaired.replace(/,\s*"(?:[^"\\]|\\.)*"\s*$/, '');     // ,"key"   (colon missing)
  repaired = repaired.replace(/,\s*"[^"]*$/, '');                    // ,"ke     (incomplete key after comma)
  repaired = repaired.replace(/,\s*$/, '');                          // ,        (trailing comma)
  repaired = repaired.replace(/:\s*$/, ': null');                    // :        (trailing colon → null)

  // 5. Close unclosed brackets
  while (stack.length > 0) {
    repaired += stack.pop();
  }

  // 6. Try parsing the repaired string
  try {
    const result = JSON.parse(repaired);
    if (typeof result === 'object' && result !== null) return result as Record<string, unknown>;
  } catch {
    // repair failed — caller will keep the previous value
  }

  return undefined;
}
