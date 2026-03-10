import { StaticItem } from '../../types';
import { SWITCH_MODEL_EVENT } from '@/components/ModelSwitchOverlay';

export const OPEN_ACCOUNT_USAGE_EVENT = 'open-account-usage';

export const modelItems = [
  new StaticItem('switch-model', 'Switch model...', {
    disabled: false,
    action: async () => {
      window.dispatchEvent(new CustomEvent(SWITCH_MODEL_EVENT));
    },
  }),
  new StaticItem('account-usage', 'Account & usage...', {
    disabled: false,
    action: async () => {
      window.dispatchEvent(new CustomEvent(OPEN_ACCOUNT_USAGE_EVENT));
    },
  }),
];
