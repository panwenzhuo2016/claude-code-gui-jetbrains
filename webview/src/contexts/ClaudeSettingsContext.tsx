import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { ClaudeSettingsState, DEFAULT_CLAUDE_SETTINGS } from '@/types/claude-settings';
import { useBridge } from '@/hooks/useBridge';

interface ClaudeSettingsContextValue {
  settings: ClaudeSettingsState;
  isLoading: boolean;
  updateSetting: <K extends keyof ClaudeSettingsState>(key: K, value: ClaudeSettingsState[K]) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const ClaudeSettingsContext = createContext<ClaudeSettingsContextValue | null>(null);

interface ClaudeSettingsProviderProps {
  children: ReactNode;
}

export function ClaudeSettingsProvider({ children }: ClaudeSettingsProviderProps) {
  const [settings, setSettings] = useState<ClaudeSettingsState>(DEFAULT_CLAUDE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const { isConnected, send, subscribe } = useBridge();

  // Load settings from bridge
  const loadFromBridge = useCallback(async (): Promise<boolean> => {
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await send('GET_CLAUDE_SETTINGS', {});
        if (response?.settings) {
          setSettings(response.settings as ClaudeSettingsState);
          return true;
        }
      } catch (error) {
        if (attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        } else {
          console.warn('[ClaudeSettingsContext] Failed to load settings from bridge after retries');
        }
      }
    }
    return false;
  }, [send]);

  // Initial load on mount
  useEffect(() => {
    loadFromBridge().finally(() => setIsLoading(false));
  }, [loadFromBridge]);

  // Listen for external changes from backend
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe('CLAUDE_SETTINGS_CHANGED', (message) => {
      const newSettings = (message.payload as Record<string, unknown>)?.settings as ClaudeSettingsState | undefined;
      if (newSettings) {
        console.log('[ClaudeSettingsContext] Settings changed externally:', newSettings);
        setSettings(newSettings);
      }
    });

    return unsubscribe;
  }, [isConnected, subscribe]);

  // Update individual setting
  const updateSetting = useCallback(
    async <K extends keyof ClaudeSettingsState>(key: K, value: ClaudeSettingsState[K]) => {
      const previousSettings = settings;
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings); // optimistic update

      try {
        if (!isConnected) {
          throw new Error('Bridge not connected');
        }
        const response = await send('SAVE_CLAUDE_SETTINGS', { key, value });
        if (response?.status === 'error') {
          throw new Error(response.error || 'Save failed');
        }
        return;
      } catch (error) {
        console.warn('[ClaudeSettingsContext] Failed to save setting:', error);
        // Revert optimistic update on error
        setSettings(previousSettings);
        throw error;
      }
    },
    [settings, isConnected, send],
  );

  // Refresh settings
  const refreshSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadFromBridge();
    } finally {
      setIsLoading(false);
    }
  }, [loadFromBridge]);

  return (
    <ClaudeSettingsContext.Provider value={{ settings, isLoading, updateSetting, refreshSettings }}>
      {children}
    </ClaudeSettingsContext.Provider>
  );
}

export function useClaudeSettings(): ClaudeSettingsContextValue {
  const context = useContext(ClaudeSettingsContext);
  if (!context) {
    throw new Error('useClaudeSettings must be used within a ClaudeSettingsProvider');
  }
  return context;
}

export { ClaudeSettingsContext };
