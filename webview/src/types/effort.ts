/**
 * Claude Code CLI의 effort level 설정.
 * ~/.claude/settings.json의 effortLevel 필드와 동기화된다.
 *
 * CLI 지원 값: low, medium, high (--effort 플래그)
 * Auto는 effortLevel을 null/undefined로 설정하여 CLI 기본값을 사용.
 */
export enum EffortLevel {
  AUTO = 'auto',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface EffortLevelDef {
  key: EffortLevel;
  label: string;
  filledDots: number;
}

export const EFFORT_LEVELS: EffortLevelDef[] = [
  { key: EffortLevel.AUTO, label: 'Auto', filledDots: 4 },
  { key: EffortLevel.LOW, label: 'Low', filledDots: 1 },
  { key: EffortLevel.MEDIUM, label: 'Medium', filledDots: 2 },
  { key: EffortLevel.HIGH, label: 'High', filledDots: 3 },
];

const TOTAL_DOTS = 4;

export function getEffortDef(key: EffortLevel): EffortLevelDef {
  return EFFORT_LEVELS.find((e) => e.key === key) ?? EFFORT_LEVELS[0];
}

export function nextEffortLevel(current: EffortLevel): EffortLevel {
  const idx = EFFORT_LEVELS.findIndex((e) => e.key === current);
  return EFFORT_LEVELS[(idx + 1) % EFFORT_LEVELS.length].key;
}

export function parseEffortLevel(value: string | null | undefined): EffortLevel {
  if (!value) return EffortLevel.AUTO;
  const match = EFFORT_LEVELS.find((e) => e.key === value);
  return match?.key ?? EffortLevel.AUTO;
}

export { TOTAL_DOTS };
