const DEFAULT_MAX_CONTEXT = 200_000;

export function getMaxContextTokens(_model: string | null): number {
  return DEFAULT_MAX_CONTEXT;
}

export function calculateContextWindowPercent(
  inputTokens: number,
  outputTokens: number,
  model: string | null,
): number {
  const maxTokens = getMaxContextTokens(model);
  const percent = Math.round(((inputTokens + outputTokens) / maxTokens) * 100);
  return Math.min(percent, 100);
}
