/**
 * 호환성 래퍼.
 *
 * 기존 API 모듈(SessionsApi, MessagesApi, ToolsApi)이
 * `import { BridgeClient } from '../bridge/BridgeClient'`로 사용 중.
 *
 * Bridge를 BridgeClient로 re-export하여 import 경로 변경 없이 동작하게 함.
 */
export { Bridge as BridgeClient, getBridge as getBridgeClient } from './Bridge';
