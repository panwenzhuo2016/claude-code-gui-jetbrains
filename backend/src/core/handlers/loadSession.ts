import type { ConnectionManager } from '../../ws/connection-manager';
import type { Bridge } from '../../bridge/bridge-interface';
import type { IPCMessage } from '../types';
import { loadSessionMessages } from '../features/loadSessionMessages';
import { markSessionAsSpawned } from '../claude-process';

export async function loadSessionHandler(
  connectionId: string,
  message: IPCMessage,
  connections: ConnectionManager,
  _bridge: Bridge,
): Promise<void> {
  const workingDir = (message.payload?.workingDir as string) || process.cwd();
  const sessionId = message.payload?.sessionId as string;
  if (sessionId) {
    // 기존 세션 로딩 → 다음 spawn 시 --resume 사용하도록 마킹
    markSessionAsSpawned(sessionId);
    connections.subscribe(connectionId, sessionId);
    const messages = await loadSessionMessages(workingDir, sessionId);
    connections.sendTo(connectionId, 'SESSION_LOADED', {
      sessionId,
      messages,
    });
  }
  connections.sendTo(connectionId, 'ACK', { requestId: message.requestId });
}
