import { useEffect, useRef } from 'react';

const FAVICON_DEFAULT = '/favicon.svg';
const FAVICON_UNREAD = '/favicon-unread.svg';

function setFavicon(href: string) {
  const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (link && link.href !== href) {
    link.href = href;
  }
}

/**
 * Hook to update the document title based on the current session and streaming state.
 *
 * Streaming state is communicated to the JetBrains IDE via a JCEF JS bridge
 * (`window.__notifyStreamingState`), NOT via document.title encoding
 * (Chromium normalizes tab characters in titles, breaking delimiter-based parsing).
 *
 * Also swaps the browser favicon to an unread variant when streaming ends
 * while the tab is hidden, and restores it when the tab becomes visible.
 */
export function useDocumentTitle(title: string | null, isStreaming: boolean) {
  const wasStreamingRef = useRef(false);
  const hasUnreadRef = useRef(false);

  useEffect(() => {
    document.title = title || 'Claude Code';
  }, [title]);

  // Notify JCEF of streaming state changes
  useEffect(() => {
    const notify = (window as unknown as Record<string, unknown>).__notifyStreamingState;
    if (typeof notify === 'function') {
      (notify as (state: string) => void)(isStreaming ? 'streaming' : 'idle');
    }
  }, [isStreaming]);

  // Detect streaming end while tab is hidden → show unread favicon
  useEffect(() => {
    if (!isStreaming && wasStreamingRef.current && document.hidden) {
      hasUnreadRef.current = true;
      setFavicon(FAVICON_UNREAD);
    }
    wasStreamingRef.current = isStreaming;
  }, [isStreaming]);

  // Restore favicon when tab becomes visible
  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden && hasUnreadRef.current) {
        hasUnreadRef.current = false;
        setFavicon(FAVICON_DEFAULT);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);
}
