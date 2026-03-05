import { useState } from 'react';
import { SettingSection, SettingRow } from '../common';
import { useSettings } from '@/contexts/SettingsContext';
import { SettingKey } from '@/types/settings';
import { ROUTE_META, Route } from '@/router/routes';
import { getAdapter, IdeAdapterType } from '@/adapters';

const TERMINAL_PRESETS: { label: string; value: string | null }[] = [
  { label: 'Default (OS built-in)', value: null },
  { label: 'Terminal', value: 'Terminal' },
  { label: 'iTerm2', value: 'iTerm2' },
  { label: 'Warp', value: 'Warp' },
];

const CUSTOM_MARKER = '__custom__';

function toSelectValue(app: string | null): string {
  if (app === null) return '';
  if (TERMINAL_PRESETS.some((p) => p.value === app)) return app;
  return CUSTOM_MARKER;
}

export function GeneralSettings() {
  const meta = ROUTE_META[Route.SETTINGS_GENERAL];
  const { settings, updateSetting } = useSettings();
  const isJetBrains = getAdapter().type === IdeAdapterType.JETBRAINS;

  const terminalApp = settings[SettingKey.TERMINAL_APP];
  const selectValue = toSelectValue(terminalApp);
  const [customInput, setCustomInput] = useState(
    selectValue === CUSTOM_MARKER ? (terminalApp ?? '') : '',
  );

  const handleSelectChange = (value: string) => {
    if (value === CUSTOM_MARKER) {
      void updateSetting(SettingKey.TERMINAL_APP, customInput || null);
    } else {
      void updateSetting(SettingKey.TERMINAL_APP, value || null);
    }
  };

  const handleCustomInput = (value: string) => {
    setCustomInput(value);
    void updateSetting(SettingKey.TERMINAL_APP, value || null);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-100 mb-6">{meta.label}</h2>

      <SettingSection title="Application">
        <SettingRow
          label="Language"
          description="Interface language (restart required)"
        >
          <select
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100"
            defaultValue="en"
          >
            <option value="en">English</option>
            <option value="ko">Korean</option>
          </select>
        </SettingRow>
      </SettingSection>

      <SettingSection title="Terminal">
        <SettingRow
          label="Terminal App"
          description={
            isJetBrains
              ? 'JetBrains IDE built-in terminal is always used.'
              : "Terminal application used when running 'Open Claude in Terminal'"
          }
        >
          {isJetBrains ? (
            <span className="text-sm text-zinc-500">JetBrains built-in terminal</span>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={selectValue}
                onChange={(e) => handleSelectChange(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100"
              >
                {TERMINAL_PRESETS.map((p) => (
                  <option key={p.value ?? ''} value={p.value ?? ''}>
                    {p.label}
                  </option>
                ))}
                <option value={CUSTOM_MARKER}>Custom...</option>
              </select>
              {selectValue === CUSTOM_MARKER && (
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => handleCustomInput(e.target.value)}
                  placeholder="e.g., Kitty"
                  className="w-40 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500"
                />
              )}
            </div>
          )}
        </SettingRow>
      </SettingSection>
    </div>
  );
}
