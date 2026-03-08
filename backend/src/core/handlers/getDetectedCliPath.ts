import { exec } from 'child_process';
import type { ConnectionManager } from '../../ws/connection-manager';
import type { Bridge } from '../../bridge/bridge-interface';
import type { IPCMessage } from '../types';
import { getAugmentedPath } from '../claude-process';

export async function getDetectedCliPathHandler(
  connectionId: string,
  message: IPCMessage,
  connections: ConnectionManager,
  _bridge: Bridge,
): Promise<void> {
  const detectedPath = await new Promise<string | null>((resolve) => {
    const cmd = process.platform === 'win32' ? 'where claude' : 'which claude';
    exec(cmd, { env: { ...process.env, PATH: getAugmentedPath() } }, (err, stdout) => {
      resolve(err ? null : stdout.trim().split('\n')[0]);
    });
  });

  connections.sendTo(connectionId, 'ACK', {
    requestId: message.requestId,
    path: detectedPath,
  });
}
