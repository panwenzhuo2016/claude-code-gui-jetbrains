import { IconType } from '@/types/commandPalette';
import { StaticItem } from '../../types';

export const supportItems = [
  new StaticItem('open-terminal', 'Open Claude in Terminal', {
    icon: IconType.Terminal,
    disabled: false,
    serviceAction: async (services) => {
      const workingDir = services.session.workingDirectory ?? '';
      await services.adapter.openTerminal(workingDir);
    },
  }),
  new StaticItem('help-docs', 'View help docs', {
    disabled: false,
    action: async () => {
      console.log('[CommandPalette] Help docs - not yet implemented');
    },
  }),
];
