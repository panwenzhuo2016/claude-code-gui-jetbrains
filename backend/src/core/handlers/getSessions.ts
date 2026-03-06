import type { ConnectionManager } from '../../ws/connection-manager';
import type { Bridge } from '../../bridge/bridge-interface';
import type { IPCMessage } from '../types';
import { getSessionsList } from '../features/getSessionsList';

export async function getSessionsHandler(
  connectionId: string,
  message: IPCMessage,
  connections: ConnectionManager,
  _bridge: Bridge,
): Promise<void> {
  const payloadWorkingDir = message.payload?.workingDir as string | undefined;
  const workingDir = payloadWorkingDir || process.cwd();

  console.error('[getSessions]', 'payload.workingDir:', payloadWorkingDir ?? '(not provided, using cwd)');
  console.error('[getSessions]', 'resolved workingDir:', workingDir);

  const sessions = await getSessionsList(workingDir);

  console.error('[getSessions]', 'returning sessions:', sessions.length);

  connections.sendTo(connectionId, 'ACK', { requestId: message.requestId, sessions });
}
