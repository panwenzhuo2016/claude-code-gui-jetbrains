import { SettingSection, SettingRow } from '../common';
import { ROUTE_META, Route } from '@/router/routes';
import { useClaudeSettings } from '@/contexts/ClaudeSettingsContext';

const LANGUAGE_OPTIONS = [
  { value: '', label: 'Default (English)' },
  { value: 'korean', label: 'Korean (한국어)' },
  { value: 'japanese', label: 'Japanese (日本語)' },
  { value: 'chinese', label: 'Chinese (中文)' },
  { value: 'spanish', label: 'Spanish (Español)' },
  { value: 'french', label: 'French (Français)' },
  { value: 'german', label: 'German (Deutsch)' },
  { value: 'portuguese', label: 'Portuguese (Português)' },
] as const;

export function GeneralSettings() {
  const meta = ROUTE_META[Route.SETTINGS_GENERAL];
  const { settings, updateSetting } = useClaudeSettings();

  const currentLanguage = (settings.language as string) ?? '';

  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-100 mb-6">{meta.label}</h2>

      <SettingSection title="Claude Code">
        <SettingRow
          label="Language"
          description="Claude's preferred response language (saved to ~/.claude/settings.json)"
        >
          <select
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100"
            value={currentLanguage}
            onChange={(e) => {
              const value = e.target.value;
              updateSetting('language', value || null);
            }}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </SettingRow>
      </SettingSection>
    </div>
  );
}
