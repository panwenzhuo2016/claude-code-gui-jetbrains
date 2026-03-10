/**
 * Claude Code settings that sync with ~/.claude/settings.json
 *
 * Structure:
 * 1. .claude/settings.json (project - not yet implemented)
 * 2. ~/.claude-code-gui/settings.js (app)
 * 3. ~/.claude/settings.json (user)
 *
 * Priority: #1 > #2 > #3 (later will merge)
 */

export interface ClaudeSettingsState {
  model: string | null; // full model ID like 'claude-opus-4-6' or null for default
  [key: string]: unknown; // extensible for future settings
}

export const DEFAULT_CLAUDE_SETTINGS: ClaudeSettingsState = {
  model: null,
};
