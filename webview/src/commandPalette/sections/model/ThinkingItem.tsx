import { StaticItem } from '../../types';
import { useClaudeSettings } from '@/contexts/ClaudeSettingsContext';
import { ToggleSwitch } from '@/components/ToggleSwitch';

export const THINKING_TOGGLE_EVENT = 'thinking-toggle';

const ThinkingToggle = () => {
  const { settings, updateSetting } = useClaudeSettings();
  const enabled = settings.alwaysThinkingEnabled ?? true;

  return (
    <ToggleSwitch
      checked={enabled}
      onChange={(value) => void updateSetting('alwaysThinkingEnabled', value)}
      size="small"
    />
  );
};

export const thinkingItem = new StaticItem('thinking', 'Thinking', {
  disabled: false,
  keepOpen: true,
  valueComponent: () => <ThinkingToggle />,
  action: async () => {
    window.dispatchEvent(new CustomEvent(THINKING_TOGGLE_EVENT));
  },
});
