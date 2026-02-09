import type { IdeAdapter } from './IdeAdapter';
import { JetBrainsAdapter } from './JetBrainsAdapter';
import { BrowserAdapter } from './BrowserAdapter';

export type { IdeAdapter } from './IdeAdapter';
export { JetBrainsAdapter } from './JetBrainsAdapter';
export { BrowserAdapter } from './BrowserAdapter';

/**
 * Singleton instance of the IDE adapter
 */
let adapterInstance: IdeAdapter | null = null;

/**
 * Detect the current environment and return the appropriate adapter type
 */
export function detectEnvironment(): 'jetbrains' | 'browser' {
  if (typeof window !== 'undefined' && window.kotlinBridge) {
    return 'jetbrains';
  }
  return 'browser';
}

/**
 * Initialize the appropriate IDE adapter based on the current environment
 *
 * @returns The initialized adapter instance
 */
export function initializeAdapter(): IdeAdapter {
  if (adapterInstance) {
    return adapterInstance;
  }

  const environment = detectEnvironment();

  if (environment === 'jetbrains') {
    console.log('[IdeAdapter] Initializing JetBrains adapter');
    adapterInstance = new JetBrainsAdapter();
  } else {
    console.log('[IdeAdapter] Initializing Browser adapter');
    adapterInstance = new BrowserAdapter();
  }

  return adapterInstance;
}

/**
 * Get the current adapter instance
 * Initializes one if not already done
 *
 * @returns The current adapter instance
 */
export function getAdapter(): IdeAdapter {
  if (!adapterInstance) {
    return initializeAdapter();
  }
  return adapterInstance;
}

/**
 * Reset the adapter instance (useful for testing or when bridge becomes available)
 */
export function resetAdapter(): void {
  adapterInstance = null;
}

/**
 * Re-initialize adapter when Kotlin bridge becomes available
 * Call this when receiving 'kotlinBridgeReady' event
 */
export function onBridgeReady(): void {
  const currentType = adapterInstance?.type;

  // If we were using browser adapter but now have Kotlin bridge, switch
  if (currentType === 'browser' && window.kotlinBridge) {
    console.log('[IdeAdapter] Kotlin bridge detected, switching to JetBrains adapter');
    resetAdapter();
    initializeAdapter();
  }
}
