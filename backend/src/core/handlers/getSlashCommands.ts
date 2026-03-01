import type { ConnectionManager } from '../../ws/connection-manager';
import type { Bridge } from '../../bridge/bridge-interface';
import type { IPCMessage } from '../types';
import { getSlashCommandsList } from '../features/getSlashCommands';

export async function getSlashCommandsHandler(
  connectionId: string,
  message: IPCMessage,
  connections: ConnectionManager,
  _bridge: Bridge,
): Promise<void> {
  try {
    const workingDir = (message.payload as Record<string, unknown>)?.workingDir as string | undefined;
    const slashCommands = await getSlashCommandsList(workingDir);
    console.error('[node-backend]', `Slash commands found: ${slashCommands.length}`, slashCommands.map(c => c.name));
    connections.sendTo(connectionId, 'ACK', {
      requestId: message.requestId,
      status: 'ok',
      slashCommands,
    });
  } catch (err) {
    connections.sendTo(connectionId, 'ACK', {
      requestId: message.requestId,
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
