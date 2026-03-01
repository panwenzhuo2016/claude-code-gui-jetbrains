import type { ConnectionManager } from '../../ws/connection-manager';
import type { Bridge } from '../../bridge/bridge-interface';
import type { IPCMessage } from '../types';
import { generateSessionId } from '../features/generateSessionId';
import { ensureClaudeProcess, sendMessageToProcess } from '../claude-process';

export async function sendMessageHandler(
  connectionId: string,
  message: IPCMessage,
  connections: ConnectionManager,
  _bridge: Bridge,
): Promise<void> {
  const content = message.payload?.content as string;
  const workingDir = (message.payload?.workingDir as string) || process.cwd();
  const msgSessionId = message.payload?.sessionId as string | undefined;
  const inputMode = message.payload?.inputMode as string;
  const resolvedSessionId = msgSessionId || generateSessionId();
  const attachments = message.payload?.attachments as Array<{
    fileName: string;
    mimeType: string;
    base64: string;
  }> | undefined;

  try {
    if (content || (attachments && attachments.length > 0)) {
      // Subscribe and ensure process is running (waits for spawn)
      connections.subscribe(connectionId, resolvedSessionId);
      await ensureClaudeProcess(connections, connectionId, workingDir, resolvedSessionId, inputMode);

      // Send content to process stdin
      sendMessageToProcess(connections, resolvedSessionId, content, attachments);

      // Broadcast user message to other subscribers (excluding sender)
      connections.broadcastToSession(resolvedSessionId, 'USER_MESSAGE_BROADCAST', {
        content: content.trim(),
        sessionId: resolvedSessionId,
      }, connectionId);
    }
  } finally {
    connections.sendTo(connectionId, 'ACK', { requestId: message.requestId });
  }
}
