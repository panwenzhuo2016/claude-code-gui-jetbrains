import { useEffect } from 'react';
import { getAdapter } from '@/adapters';

/**
 * Hook to handle keyboard shortcuts in the WebView.
 *
 * Shortcuts:
 * - Cmd+N (Mac) / Ctrl+N (Windows/Linux): Open new tab (clicks the new tab button)
 * - Cmd+, (Mac) / Ctrl+, (Windows/Linux): Open settings in new tab
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+N (Mac) or Ctrl+N (Windows/Linux) - Open new tab
      // Note: In JetBrains IDE, this is handled by NewClaudeCodeTabAction instead
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        e.stopPropagation();

        const newTabButton = document.getElementById('new-tab-button');
        if (newTabButton) {
          newTabButton.click();
        }
      }

      // Cmd+, (Mac) or Ctrl+, (Windows/Linux) - Open settings in new tab
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        e.stopPropagation();

        getAdapter().openSettings().catch((error) => {
          console.error('[useKeyboardShortcuts] Failed to open settings:', error);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
