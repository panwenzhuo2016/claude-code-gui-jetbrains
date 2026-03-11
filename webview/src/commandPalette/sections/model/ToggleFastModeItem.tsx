import { useEffect } from 'react';
import { StaticItem } from '../../types';
import { useClaudeSettings } from '@/contexts/ClaudeSettingsContext';
import { useChatStreamContext } from '@/contexts/ChatStreamContext';
import { ClaudeModel } from '@/types/models';
import { ToggleSwitch } from '@/components/ToggleSwitch';

export const FAST_MODE_TOGGLE_EVENT = 'fast-mode-toggle';

function isOpusModel(sessionModel: ClaudeModel | null, settingsModel: string | null): boolean {
  if (sessionModel === ClaudeModel.OPUS) return true;
  if (sessionModel === ClaudeModel.DEFAULT || sessionModel === null) {
    // settingsModel이 null/undefined이면 CLI 기본 모델(Opus)을 사용 중
    if (!settingsModel) return true;
    return settingsModel.includes('opus');
  }
  return false;
}

// disabled를 런타임에 동적으로 변경할 수 있도록 backing field + getter/setter 설정
let _disabled = false;
const _toggleFastModeItem = new StaticItem('toggle-fast-mode', 'Toggle fast mode (Opus 4.6 only)', {
  disabled: false,
  keepOpen: true,
  valueComponent: () => <FastModeToggle />,
  action: async () => {
    window.dispatchEvent(new CustomEvent(FAST_MODE_TOGGLE_EVENT));
  },
});
Object.defineProperty(_toggleFastModeItem, 'disabled', {
  get: () => _disabled,
  set: (v: boolean) => { _disabled = v; },
  enumerable: true,
  configurable: true,
});
export const toggleFastModeItem = _toggleFastModeItem;

const FastModeToggle = () => {
  const { settings, updateSetting } = useClaudeSettings();
  const { sessionModel } = useChatStreamContext();
  const isOpus = isOpusModel(sessionModel, settings.model);
  const enabled = settings.preferFastMode ?? false;

  // 행(row) disabled 상태를 isOpus에 따라 동적으로 갱신
  (toggleFastModeItem as unknown as { disabled: boolean }).disabled = !isOpus;

  // 행(row) 클릭 시 발생하는 이벤트 처리 (isOpus일 때만 토글)
  useEffect(() => {
    const handler = () => {
      if (!isOpus) return;
      void updateSetting('preferFastMode', !enabled);
    };
    window.addEventListener(FAST_MODE_TOGGLE_EVENT, handler);
    return () => window.removeEventListener(FAST_MODE_TOGGLE_EVENT, handler);
  }, [isOpus, enabled, updateSetting]);

  return (
    <ToggleSwitch
      checked={enabled}
      onChange={(value) => void updateSetting('preferFastMode', value)}
      disabled={!isOpus}
      size="small"
    />
  );
};
