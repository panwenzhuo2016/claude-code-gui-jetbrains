import { createContext, useContext, ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from './SettingsContext';
import { SettingKey } from '@/types/settings';

type ThemeContextType = ReturnType<typeof useTheme>;

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { settings } = useSettings();
  // Bridge settings theme to useTheme so DOM class stays in sync
  const theme = useTheme(settings[SettingKey.THEME]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
