import type { IdeAdapter } from './IdeAdapter';

/**
 * Browser Adapter
 *
 * Handles operations when running in a browser environment (dev mode).
 * Opens new browser tabs using window.open().
 */
export class BrowserAdapter implements IdeAdapter {
  readonly type = 'browser' as const;

  isReady(): boolean {
    return true; // Browser is always ready
  }

  async openNewTab(): Promise<void> {
    // Open a new browser tab with the same URL
    const newWindow = window.open(window.location.href, '_blank');

    if (!newWindow) {
      throw new Error('Failed to open new tab. Pop-up might be blocked.');
    }

    console.log('[BrowserAdapter] Opened new browser tab');
  }
}
