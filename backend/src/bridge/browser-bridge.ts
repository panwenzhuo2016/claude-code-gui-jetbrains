import { exec } from 'child_process';
import type { Bridge } from './bridge-interface';
import { readSettingsFile } from '../core/features/settings';

/**
 * Browser-mode bridge for dev environment.
 * Uses OS-native commands for file opening; other IDE-specific
 * operations are no-ops since there is no IDE host.
 */
export class BrowserBridge implements Bridge {
  async openFile(path: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const command = process.platform === 'darwin'
        ? `open "${path}"`
        : `xdg-open "${path}"`;

      exec(command, (err) => {
        if (err) {
          console.error('[node-backend]', 'Failed to open file:', err.message);
        }
        resolve();
      });
    });
  }

  async openDiff(): Promise<void> {
    // no-op: diff viewer not available in browser mode
  }

  async applyDiff(): Promise<{ applied: boolean }> {
    return { applied: false };
  }

  async rejectDiff(): Promise<void> {
    // no-op
  }

  async newSession(): Promise<void> {
    // no-op: handled by session reset in browser mode
  }

  async openSettings(): Promise<void> {
    // no-op
  }

  async openUrl(url: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const command = process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;

      exec(command, (err) => {
        if (err) {
          console.error('[node-backend]', 'Failed to open URL:', err.message);
        }
        resolve();
      });
    });
  }

  async openTerminal(workingDir: string): Promise<void> {
    const settings = await readSettingsFile();
    const terminalApp = settings['terminalApp'] as string | null;

    const claudePath = await new Promise<string>((resolve) => {
      exec('which claude', (err, stdout) => {
        resolve(err ? 'claude' : stdout.trim());
      });
    });

    if (process.platform === 'darwin') {
      const app = terminalApp || 'Terminal';
      const escapedDir = workingDir.replace(/"/g, '\\"');
      const isITerm = app === 'iTerm' || app === 'iTerm2' || app.toLowerCase().includes('iterm');
      const script = isITerm
        ? `tell application "${app}"
             activate
             set newWindow to (create window with default profile)
             tell current session of newWindow
               write text "cd \\"${escapedDir}\\"; ${claudePath}"
             end tell
           end tell`
        : `tell application "${app}"
             activate
             do script "cd \\"${escapedDir}\\"; ${claudePath}"
           end tell`;

      exec(`osascript -e '${script.replace(/'/g, "'\\''")}'`, (err) => {
        if (err) {
          console.error('[node-backend]', 'Failed to open terminal:', err.message);
        }
      });
    } else {
      const terminal = terminalApp || 'x-terminal-emulator';
      exec(`${terminal} -e "cd '${workingDir}'; ${claudePath}"`, (err) => {
        if (err) {
          console.error('[node-backend]', 'Failed to open terminal:', err.message);
        }
      });
    }
  }
}
