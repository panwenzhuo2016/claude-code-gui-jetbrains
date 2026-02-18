import type { IdeAdapter } from './IdeAdapter';
import { getBridge } from '../api/bridge/Bridge';

/**
 * JetBrains IDE Adapter
 *
 * Uses the Bridge singleton to communicate with the JetBrains IDE.
 * Opens new editor tabs within the IDE.
 */
export class JetBrainsAdapter implements IdeAdapter {
  readonly type = 'jetbrains' as const;

  isReady(): boolean {
    return getBridge().isConnected;
  }

  async openNewTab(): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Bridge is not ready');
    }

    const message: IPCMessage = {
      type: 'NEW_SESSION',
      payload: {},
      timestamp: Date.now(),
    };

    getBridge().sendRaw(message);
    console.log('[JetBrainsAdapter] Sent NEW_SESSION to open new editor tab');
  }

  async openSettings(): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Bridge is not ready');
    }

    const message: IPCMessage = {
      type: 'OPEN_SETTINGS',
      payload: {},
      timestamp: Date.now(),
    };

    getBridge().sendRaw(message);
    console.log('[JetBrainsAdapter] Sent OPEN_SETTINGS to open settings in new tab');
  }
}
