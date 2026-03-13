# 로깅 시스템

백엔드와 WebView의 모든 `console.*` 출력을 파일에 기록한다.

## 구조

| 구성 요소 | 파일 | 역할 |
|----------|------|------|
| `FileLogger` | `backend/src/logging/file-logger.ts` | 파일 쓰기, 로테이션(5MB), 용량 관리(2GB) |
| `LogWebSocketServer` | `backend/src/logging/log-ws.ts` | `/logs` 전용 WebSocket, WebView 로그 수신 |
| `Logger` | `backend/src/logging/logger.ts` | 파사드. console 인터셉트 + FileLogger + LogWS 통합 |
| `LogForwarder` | `webview/src/api/logging/LogForwarder.ts` | WebView console.* 캡처 → 백엔드 배치 전송 |

## 로그 파일 위치

```
~/.claude-code-gui/logs/
  server.log                          ← 활성 로그
  server-20260313T153000123Z.log      ← 아카이브
```

## 로그 형식

```
{ISO timestamp} {LEVEL} [{source}][{sessionId?}] {message}
```

예시:
```
2026-03-13T14:30:22.123Z ERROR [node-backend] WebSocket server listening on port 3456
2026-03-13T14:31:00.345Z LOG [webview][abc123] SessionDropdown rendered
```

## WebSocket 채널

| 경로 | 용도 |
|------|------|
| `/ws` | 채팅/스트리밍 (기존) |
| `/logs` | 로그 전용 (WebView → 백엔드 로그 전송 + 실시간 로그 브로드캐스트) |

## 규칙

- **외부 로깅 라이브러리 사용하지 않음**: `createWriteStream` 기반 직접 구현
- **console 인터셉트는 원본 함수를 반드시 유지**: JetBrains 모드에서 Kotlin이 stderr를 읽으므로, 원본 `console.error` 등이 stderr로 출력되어야 함
- **재진입 방지**: Logger 내부에서 console을 호출하면 무한 재귀가 발생하므로 `isIntercepting` 플래그로 차단
- **로테이션 중 로그 유실 방지**: `isRotating` + `rotationBuffer` 메커니즘 사용
- **Graceful shutdown**: `stream.end()` + `finish` 이벤트 대기 (5초 타임아웃)
- **초기화 순서**: `initLogger()` → `interceptConsole()` → 서버 시작 → `setLogWs()` (LogWS 미설정 구간에서는 파일 기록만)

## 로테이션

- **기준**: 활성 로그(`server.log`)가 50MB 초과 시
- **아카이브 파일명**: `server-{timestamp}.log` (timestamp: ISO 8601에서 `:`, `.` 제거)
- **보관 한도**: `logs/` 폴더 총합 2GB, 초과 시 오래된 아카이브부터 삭제
- **로테이션 중 버퍼링**: `isRotating` 플래그 + `rotationBuffer[]`에 적재 → 새 stream open 후 flush

## 초기화 흐름

### 백엔드 (`server.ts`)

```
main() {
  initLogger()           // 1. FileLogger 즉시 초기화
  logger.init()          // 2. 로그 디렉토리 생성 + WriteStream 열기
  logger.interceptConsole()  // 3. 여기서부터 모든 console.* 캡처
  // ... 서버 시작 ...
  logger.setLogWs(logWs)    // 4. LogWS 참조 설정 (이후 WS 브로드캐스트 시작)
}
```

### WebView (`main.tsx`)

```
initLogForwarder()       // 앱 렌더링 전에 초기화
// ... React 렌더링 ...
// SessionContext에서 currentSessionId 변경 시 getLogForwarder().setSessionId() 호출
```
