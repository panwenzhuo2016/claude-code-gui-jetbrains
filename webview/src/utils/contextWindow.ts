const SYSTEM_OVERHEAD = 13_000;

export function calculateContextWindowPercent(
  totalTokens: number,
  contextWindow: number,
  maxOutputTokens: number,
): number {
  const availableTokens = Math.max(contextWindow - maxOutputTokens - SYSTEM_OVERHEAD, 1);
  const percent = Math.round((totalTokens / availableTokens) * 100);
  return Math.min(percent, 100);
}
