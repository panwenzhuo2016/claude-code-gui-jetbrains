import type { ConnectionManager } from '../../ws/connection-manager';
import type { Bridge } from '../../bridge/bridge-interface';
import type { IPCMessage } from '../types';

export async function openTerminalHandler(
  connectionId: string,
  message: IPCMessage,
  connections: ConnectionManager,
  bridge: Bridge,
): Promise<void> {
  try {
    const workingDir = message.payload?.['workingDir'] as string | undefined;
    await bridge.openTerminal(workingDir || process.cwd());
  } catch (err) {
    console.error('[node-backend]', 'bridge.openTerminal() failed:', err);
  }
  connections.sendTo(connectionId, 'ACK', { requestId: message.requestId });
}
