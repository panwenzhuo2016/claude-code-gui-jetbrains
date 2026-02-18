// webview/src/api/bridge/Connector.ts

export type RawMessageHandler = (message: IPCMessage) => void;
export type ConnectionChangeHandler = (connected: boolean) => void;

export interface Connector {
  /**
   * 연결 수립. KotlinConnector: bridge ready 확인, WebSocketConnector: WS open 대기.
   * 이미 연결된 상태에서 호출하면 즉시 resolve.
   */
  connect(): Promise<void>;

  /**
   * 연결 해제 (재연결 방지).
   * WebSocket: onclose=null 후 close(), Kotlin: dispatchKotlinMessage=undefined
   */
  disconnect(): void;

  /**
   * 메시지 전송. 연결되지 않은 상태에서 호출하면 throw.
   */
  send(message: IPCMessage): void;

  /**
   * 수신 메시지 핸들러 등록. 반환값: unsubscribe 함수.
   * 여러 핸들러 등록 가능 (Set 기반).
   */
  onMessage(handler: RawMessageHandler): () => void;

  /**
   * 현재 연결 상태.
   */
  readonly isConnected: boolean;

  /**
   * 연결 상태 변경 콜백 등록. 반환값: unsubscribe 함수.
   */
  onConnectionChange(handler: ConnectionChangeHandler): () => void;

  /**
   * 연결 준비 대기. 이미 연결되어 있으면 즉시 resolve, 아니면 연결될 때까지 대기.
   * Bridge에서 send 전 연결 대기에 사용.
   */
  ensureReady(): Promise<void>;
}
