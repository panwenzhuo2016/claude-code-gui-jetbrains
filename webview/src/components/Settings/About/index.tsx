import { SettingSection, SettingRow } from '../common';
import { ROUTE_META, Route } from '@/router/routes';
import { useVersionInfo } from '@/hooks/useVersionInfo';

export function AboutSettings() {
  const meta = ROUTE_META[Route.SETTINGS_ABOUT];
  const { pluginVersion, cliVersion } = useVersionInfo();

  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-100 mb-6">{meta.label}</h2>

      <SettingSection title="Version Information">
        <SettingRow label="Plugin Version">
          <span className="text-sm text-zinc-400">{pluginVersion}</span>
        </SettingRow>

        <SettingRow label="Claude Code Version">
          <span className="text-sm text-zinc-400">{cliVersion ?? 'not detected'}</span>
        </SettingRow>
      </SettingSection>

      <SettingSection title="Links">
        <SettingRow label="Documentation">
          <a
            href="https://github.com/yhk1038/claude-code-gui-jetbrains"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
          >
            View on GitHub
          </a>
        </SettingRow>

        <SettingRow label="Report Issue">
          <a
            href="https://github.com/yhk1038/claude-code-gui-jetbrains/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
          >
            Open Issue
          </a>
        </SettingRow>
      </SettingSection>
    </div>
  );
}
