import { SlashCommand } from '../../types';
import { InputModeValues } from '@/types/chatInput';

export class CompactCommand extends SlashCommand {
  readonly id = 'cmd-compact';
  readonly label = '/compact';
  readonly description = 'Compact conversation';

  async execute(): Promise<void> {
    const { chatStream, session } = this.getServices();
    if (!session.currentSessionId) return;
    chatStream.sendMessage(this.label, InputModeValues.AUTO_EDIT);
  }
}
