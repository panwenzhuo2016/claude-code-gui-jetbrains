import type { ConnectionManager } from '../../ws/connection-manager';
import type { Bridge } from '../../bridge/bridge-interface';
import type { IPCMessage } from '../types';
import { detectInstalledTerminals } from '../features/detectTerminals';

export async function getAvailableTerminalsHandler(
  connectionId: string,
  message: IPCMessage,
  connections: ConnectionManager,
  _bridge: Bridge,
): Promise<void> {
  const result = await detectInstalledTerminals();
  connections.sendTo(connectionId, 'ACK', {
    requestId: message.requestId,
    terminals: result,
  });
}
