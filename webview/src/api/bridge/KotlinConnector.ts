// webview/src/api/bridge/KotlinConnector.ts

import type { Connector, RawMessageHandler, ConnectionChangeHandler } from './Connector';

const CONNECT_TIMEOUT_MS = 30_000;

export class KotlinConnector implements Connector {
  private connected = false;
  private messageHandlers = new Set<RawMessageHandler>();
  private connectionChangeHandlers = new Set<ConnectionChangeHandler>();
  private cleanupFn: (() => void) | null = null;

  get isConnected(): boolean {
    return this.connected;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    const setup = () => {
      console.log('[KotlinConnector] Setting up Kotlin bridge');
      this.connected = true;
      this.notifyConnectionChange(true);

      // Kotlin -> WebView 메시지 수신 콜백 등록
      window.dispatchKotlinMessage = (msg: IPCMessage) => {
        this.messageHandlers.forEach(handler => {
          try {
            handler(msg);
          } catch (error) {
            console.error('[KotlinConnector] Error in message handler:', error);
          }
        });
      };
    };

    // window.kotlinBridge가 이미 존재하면 즉시 설정
    if (window.kotlinBridge) {
      setup();
      return;
    }

    // kotlinBridgeReady 이벤트 대기 (30초 타임아웃)
    return new Promise<void>((resolve, reject) => {
      let resolved = false;

      const complete = () => {
        if (resolved) return;
        resolved = true;
        window.removeEventListener('kotlinBridgeReady', handleBridgeReady);
        clearTimeout(timeoutId);
        setup();
        resolve();
      };

      const handleBridgeReady = () => {
        console.log('[KotlinConnector] Received kotlinBridgeReady event');
        if (window.kotlinBridge) {
          complete();
        }
      };

      const timeoutId = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        window.removeEventListener('kotlinBridgeReady', handleBridgeReady);
        this.cleanupFn = null;
        reject(new Error(`Kotlin bridge not ready within ${CONNECT_TIMEOUT_MS}ms`));
      }, CONNECT_TIMEOUT_MS);

      window.addEventListener('kotlinBridgeReady', handleBridgeReady);

      // cleanup 등록 (disconnect 시 리스너 제거용)
      this.cleanupFn = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
        }
        window.removeEventListener('kotlinBridgeReady', handleBridgeReady);
      };

      // 이벤트 등록 후 다시 확인 (race condition 방지)
      if (window.kotlinBridge) {
        complete();
      }
    });
  }

  disconnect(): void {
    this.cleanupFn?.();
    this.cleanupFn = null;
    window.dispatchKotlinMessage = undefined;
    this.connected = false;
    this.notifyConnectionChange(false);
  }

  send(message: IPCMessage): void {
    if (!window.kotlinBridge?.send) {
      throw new Error('Kotlin bridge is not available');
    }
    window.kotlinBridge.send(message);
  }

  onMessage(handler: RawMessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  onConnectionChange(handler: ConnectionChangeHandler): () => void {
    this.connectionChangeHandlers.add(handler);
    return () => {
      this.connectionChangeHandlers.delete(handler);
    };
  }

  async ensureReady(): Promise<void> {
    if (this.connected) return;
    await this.connect();
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionChangeHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error('[KotlinConnector] Error in connection change handler:', error);
      }
    });
  }
}
