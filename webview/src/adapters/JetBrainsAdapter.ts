import type { IdeAdapter } from './IdeAdapter';

/**
 * JetBrains IDE Adapter
 *
 * Uses the Kotlin bridge to communicate with the JetBrains IDE.
 * Opens new editor tabs within the IDE.
 */
export class JetBrainsAdapter implements IdeAdapter {
  readonly type = 'jetbrains' as const;

  private bridge: NonNullable<typeof window.kotlinBridge>;

  constructor() {
    if (!window.kotlinBridge) {
      throw new Error('JetBrainsAdapter requires kotlinBridge to be available');
    }
    this.bridge = window.kotlinBridge;
  }

  isReady(): boolean {
    return !!this.bridge?.send;
  }

  async openNewTab(): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Kotlin bridge is not ready');
    }

    const message: IPCMessage = {
      type: 'NEW_SESSION',
      payload: {},
      timestamp: Date.now(),
    };

    this.bridge.send(message);
    console.log('[JetBrainsAdapter] Sent NEW_SESSION to open new editor tab');
  }

  async openSettings(): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Kotlin bridge is not ready');
    }

    const message: IPCMessage = {
      type: 'OPEN_SETTINGS',
      payload: {},
      timestamp: Date.now(),
    };

    this.bridge.send(message);
    console.log('[JetBrainsAdapter] Sent OPEN_SETTINGS to open settings in new tab');
  }
}
