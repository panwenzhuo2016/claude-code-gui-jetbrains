import { useCallback, useEffect, useState } from 'react';
import { ThemeMode } from '../types';

interface UseThemeReturn {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

/**
 * Resolve effective theme: SYSTEM -> detect OS preference, otherwise use explicit value.
 * Apply the resolved theme to <html> classList for Tailwind dark mode.
 */
export function useTheme(settingsTheme?: ThemeMode): UseThemeReturn {
  const resolveTheme = useCallback((mode: ThemeMode): 'light' | 'dark' => {
    if (mode === ThemeMode.SYSTEM) {
      // In JCEF, prefers-color-scheme may not reflect IDE theme,
      // but it's the best fallback for browser environment
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode === ThemeMode.DARK ? 'dark' : 'light';
  }, []);

  const initialMode = settingsTheme ?? ThemeMode.LIGHT;
  const [theme, setThemeState] = useState<ThemeMode>(initialMode);

  // Apply theme class to <html> element
  const applyToDOM = useCallback((resolved: 'light' | 'dark') => {
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Sync with settings theme when it changes externally
  useEffect(() => {
    if (settingsTheme === undefined) return;
    setThemeState(settingsTheme);
    applyToDOM(resolveTheme(settingsTheme));
  }, [settingsTheme, resolveTheme, applyToDOM]);

  // Listen for OS theme changes (only relevant when mode is SYSTEM)
  useEffect(() => {
    if (theme !== ThemeMode.SYSTEM) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      applyToDOM(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, applyToDOM]);

  // Apply on initial mount
  useEffect(() => {
    applyToDOM(resolveTheme(theme));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    applyToDOM(resolveTheme(newTheme));
  }, [resolveTheme, applyToDOM]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK);
  }, [theme, setTheme]);

  const resolved = resolveTheme(theme);
  const isDark = resolved === 'dark';

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
  };
}
