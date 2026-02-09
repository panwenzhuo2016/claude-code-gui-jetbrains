import { useEffect } from 'react';

/**
 * Hook to handle keyboard shortcuts in the WebView.
 *
 * Shortcuts:
 * - Cmd+N (Mac) / Ctrl+N (Windows/Linux): Open new tab (clicks the new tab button)
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
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
