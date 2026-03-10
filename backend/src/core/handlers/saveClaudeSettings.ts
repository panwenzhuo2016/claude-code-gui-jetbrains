import type { ConnectionManager } from '../../ws/connection-manager';
import type { Bridge } from '../../bridge/bridge-interface';
import type { IPCMessage } from '../types';
import { saveClaudeSetting } from '../features/claude-settings';

export async function saveClaudeSettingsHandler(
  connectionId: string,
  message: IPCMessage,
  connections: ConnectionManager,
  _bridge: Bridge,
): Promise<void> {
  const key = message.payload?.key as string;
  const value = message.payload?.value;
  const result = await saveClaudeSetting(key, value);
  connections.sendTo(connectionId, 'ACK', {
    requestId: message.requestId,
    ...result,
  });
}