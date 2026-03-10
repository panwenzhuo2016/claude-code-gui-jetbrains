import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync, watch } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CLAUDE_SETTINGS_FILE = join(homedir(), '.claude', 'settings.json');

/**
 * ~/.claude/settings.json 전체를 읽어 반환한다.
 * 파일이 없으면 빈 객체를 반환한다.
 */
export async function readClaudeSettings(): Promise<Record<string, unknown>> {
  try {
    if (!existsSync(CLAUDE_SETTINGS_FILE)) {
      return {};
    }
    const raw = await readFile(CLAUDE_SETTINGS_FILE, 'utf-8');
    return JSON.parse(raw) as Record<string, unknown>;
  } catch (err) {
    console.error('[node-backend]', 'Failed to read Claude settings:', err);
    return {};
  }
}

/**
 * ~/.claude/settings.json의 단일 키-값을 저장한다.
 * value가 null이면 해당 키를 삭제한다.
 * 기존 키들은 보존한다.
 */
export async function saveClaudeSetting(
  key: string,
  value: unknown,
): Promise<{ status: 'ok' | 'error'; error?: string }> {
  try {
    const current = await readClaudeSettings();
    if (value === null || value === undefined) {
      delete current[key];
    } else {
      current[key] = value;
    }
    await mkdir(join(homedir(), '.claude'), { recursive: true });
    await writeFile(CLAUDE_SETTINGS_FILE, JSON.stringify(current, null, 2) + '\n', 'utf-8');
    return { status: 'ok' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[node-backend]', 'Failed to save Claude setting:', err);
    return { status: 'error', error: msg };
  }
}

// ─── File Watcher ──────────────────────────────────────────────────────────

let watcherInstance: ReturnType<typeof watch> | null = null;
let debounceTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_MS = 300;

/**
 * Watch ~/.claude/settings.json for external changes
 * Calls onFileChange callback when file is modified
 *
 * Usage:
 *   watchClaudeSettingsFile((settings) => {
 *     connections.broadcastToAll('CLAUDE_SETTINGS_CHANGED', { settings });
 *   });
 */
export function watchClaudeSettingsFile(onFileChange: (settings: Record<string, unknown>) => void): void {
  // Prevent duplicate watchers
  if (watcherInstance) {
    console.log('[node-backend]', 'Claude settings file watcher already started');
    return;
  }

  try {
    const settingsDir = join(homedir(), '.claude');

    watcherInstance = watch(settingsDir, async (eventType, filename) => {
      // Only watch settings.json file
      if (filename !== 'settings.json') {
        return;
      }

      // Debounce multiple rapid file changes (fs.watch can trigger multiple times)
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(async () => {
        try {
          const settings = await readClaudeSettings();
          console.log('[node-backend]', 'Claude settings file changed, broadcasting:', settings);
          onFileChange(settings);
        } catch (err) {
          console.error('[node-backend]', 'Error reading Claude settings after file change:', err);
        }
      }, DEBOUNCE_MS);
    });

    console.log('[node-backend]', `Watching ${CLAUDE_SETTINGS_FILE} for changes`);
  } catch (err) {
    console.error('[node-backend]', 'Failed to start Claude settings file watcher:', err);
  }
}

/**
 * Stop watching Claude settings file
 */
export function stopWatchingClaudeSettingsFile(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  if (watcherInstance) {
    watcherInstance.close();
    watcherInstance = null;
    console.log('[node-backend]', 'Claude settings file watcher stopped');
  }
}
