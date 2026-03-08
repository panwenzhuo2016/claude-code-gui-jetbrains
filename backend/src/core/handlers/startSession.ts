import type { ConnectionManager } from '../../ws/connection-manager';
import type { Bridge } from '../../bridge/bridge-interface';
import type { IPCMessage } from '../types';
import { ensureClaudeProcess } from '../claude-process';

export async function startSessionHandler(
  connectionId: string,
  message: IPCMessage,
  connections: ConnectionManager,
  _bridge: Bridge,
): Promise<void> {
  const workingDir = (message.payload?.workingDir as string) || process.cwd();
  const sessionId = message.payload?.sessionId as string | undefined;
  const inputMode = (message.payload?.inputMode as string) || 'ask_before_edit';

  try {
    if (sessionId) {
      connections.subscribe(connectionId, sessionId);
      await ensureClaudeProcess(connections, connectionId, workingDir, sessionId, inputMode);
    }
  } catch (err) {
    // ensureClaudeProcess already broadcasts SERVICE_ERROR to the session.
    console.error('[node-backend]', 'startSession failed:', err);
  }

  connections.sendTo(connectionId, 'ACK', { requestId: message.requestId });
}
