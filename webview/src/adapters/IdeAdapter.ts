/**
 * IDE Adapter Interface
 *
 * Abstracts IDE-specific operations so the WebView can work
 * in both JetBrains IDE and browser environments.
 */
export interface IdeAdapter {
  /**
   * The type of environment this adapter handles
   */
  readonly type: 'jetbrains' | 'browser';

  /**
   * Open a new tab/window
   * - In JetBrains: Opens a new editor tab via Kotlin bridge
   * - In Browser: Opens a new browser tab
   */
  openNewTab(): Promise<void>;

  /**
   * Check if the adapter is ready to use
   */
  isReady(): boolean;
}
