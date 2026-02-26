# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

JetBrains IDE용 Claude Code GUI 플러그인. Cursor의 Claude Code 확장과 동일한 UX를 JetBrains 환경에서 제공하는 것이 목표.

## 아키텍처

3개 레이어로 구성:

1. **IDE Plugin (Kotlin/JVM)** - JetBrains Platform SDK 기반, WebView 호스팅, 파일시스템 연동
2. **WebView UI (JCEF)** - 채팅/세션/diff 카드 UI, Cursor UX 동일 구현
3. **AI Bridge (별도 프로세스)** - Claude Code 에이전트 실행, 스트리밍 파싱, 상태 관리

## 참고 저장소

구현 시 `idea-claude-code-gui` (GitHub) 저장소를 1차 기준으로 삼음. 우선순위: Cursor UX > 참고 저장소 > JetBrains 관행

## 기술 제약

- WebView는 JCEF 사용 (Swing UI 사용 금지, 권한 다이얼로그 예외)
- 에이전트 런타임은 IDE 외부 프로세스로 분리
- 이벤트 기반, 스트리밍 우선 설계

## 듀얼 백엔드 동기화 규칙

WebView는 두 가지 백엔드와 통신한다:

| 환경 | 전송 채널 | 백엔드 |
|------|----------|--------|
| 개발 (`pnpm dev`) | WebSocket | `webview/dev-bridge.ts` (Node.js) |
| 운영 (빌드된 플러그인) | Kotlin bridge (JCEF `JBCefJSQuery`) | `src/main/kotlin/.../WebViewBridge.kt`, `ClaudeSessionService.kt` 등 |

WebView 코드(`useBridge.ts`)는 `import.meta.env.DEV`/`PROD`로 전송 채널만 분기하며, 메시지 포맷(`IPCMessage`)과 핸들러 타입은 동일하다.

> **필수**: 두 백엔드는 동일한 메시지에 대해 동일한 구조의 응답을 반환해야 한다.
>
> - **Kotlin 백엔드 핸들러를 수정하면** → `dev-bridge.ts`의 대응 핸들러도 동일하게 수정
> - **dev-bridge.ts 핸들러를 수정하면** → Kotlin 대응 핸들러와 응답 구조가 일치하는지 확인
> - 새 메시지 타입을 추가하면 양쪽 모두 구현
> - 응답 payload의 필드명/타입/중첩 구조가 정확히 일치해야 함 (예: `content`를 배열로 보내면 양쪽 다 배열)

## 원본 데이터 보존 원칙

Claude Code CLI가 생성하는 원본 자료구조(JSONL 엔트리, 세션 메타데이터 등)는 **WebView 끝단까지 구조를 그대로 유지**해야 한다.

### 규칙

1. **키/값 리네이밍 금지**: 원본 필드명을 중간 계층에서 다른 이름으로 바꾸지 않는다. (예: `title` → ~~`firstPrompt`~~, `createdAt` → ~~`created`~~)
2. **중간 필터링 금지**: 중간 전달 계층(dev-bridge, Kotlin 백엔드)이 원본 데이터를 필터링하거나 누락시키지 않는다. 필터링은 최종 소비자인 WebView에서 책임진다.
3. **정보 손실 금지**: 현재 UI에서 쓰지 않는 필드라도 전달 경로에서 제거하지 않는다. 향후 활용 가능성을 보존한다.
4. **데이터 형변환은 허용**: 언어 간 타입 매핑(예: JSON → Kotlin data class → JSON)은 허용하되, 이 과정에서 키 이름이나 구조가 변하면 안 된다.

### 이유

- 프로젝트가 아직 Claude Code의 원본 데이터를 전부 활용하지 못하고 있다. 중간 계층이 정보를 편집하면, 나중에 원본 구조를 다시 파악하는 데 불필요한 비용이 든다.
- **어느 계층에서든 데이터를 보면 "Claude Code 원본이 어떻게 생겼는지"를 알 수 있어야 하고, 그 내용을 신뢰할 수 있어야 한다.**

### 적용 범위

| 계층 | 역할 | 해도 되는 것 | 하면 안 되는 것 |
|------|------|-------------|---------------|
| dev-bridge / Kotlin 백엔드 | 원본 전달 | 타입 변환, 직렬화 | 필드 리네이밍, 필터링, 누락 |
| WebView (React) | 최종 소비 | 필터링, 정렬, 표시용 가공 | — |

## 상태 머신

Idle → Streaming → Waiting Permission → Has Diff → Error

## UI 용어 정의

| 용어 | 설명 |
|------|------|
| **상단바** | 채팅 화면 상단의 새 탭 버튼과 세션 드롭다운 토글 버튼을 포함하는 영역 요소 |
| **세션 드롭다운 토글 버튼** | 상단바 좌측에 현재 세션의 제목을 표시하는 드롭다운 토글 버튼 |
| **세션 드롭다운** | 세션 드롭다운 토글 버튼을 클릭해 열리는 드롭다운 메뉴 |
| **새 탭 버튼** | 상단바 우측에 있는 플러스 버튼. 클릭 시 IDE에서 새로운 Claude Code 에디터 탭을 열음 |
| **초기화된 세션** | 아직 첫 번째 메시지도 시작하지 않아서 세션이 생성되지 않은 상태 |

## 빌드 명령어 (direnv)

이 프로젝트는 `.envrc`를 통해 빌드 관련 alias를 정의합니다.
터미널에서 `de` 명령으로 로드하거나, 이 디렉토리 진입 시 자동 로드됩니다.

### 에이전트 필수 규칙

> **중요**: 아래 정의된 alias를 반드시 사용하세요. 직접 명령을 구성하지 마세요.

| Alias | 용도 | 금지된 직접 명령 |
|-------|------|-----------------|
| `build` | 전체 빌드 | ~~./gradlew build~~ |
| `run-ide` | IDE 테스트 실행 | ~~./gradlew runIde~~ |
| `build-plugin` | 배포용 ZIP 생성 | ~~./gradlew buildPlugin~~ |
| `clean` | 클린 | ~~./gradlew clean~~ |
| `test` | 테스트 | ~~./gradlew test~~ |
| `watch` | 자동 빌드 | ~~./gradlew build --continuous~~ |
| `wv-dev` | WebView 개발 서버 | ~~cd webview && pnpm dev~~ |
| `wv-build` | WebView 빌드 | ~~cd webview && pnpm build~~ |
| `wv-lint` | TypeScript 체크 | ~~cd webview && pnpm lint~~ |
| `wv-install` | 의존성 설치 | ~~cd webview && pnpm install~~ |
| `full-build` | 전체 빌드 | ~~wv-build && build~~ |
| `dist` | 배포 빌드 | ~~wv-build && build-plugin~~ |
| `ide-log` | IDE 로그 확인 | ~~tail -f build/idea-sandbox/...~~ |

### 에이전트 행동 지침

1. **빌드/테스트 시**: 반드시 위 alias 사용
2. **새 명령 필요 시**: 직접 실행하지 말고 `.envrc`에 추가 제안
3. **경로 하드코딩 금지**: alias에 이미 경로가 포함되어 있음

## 작업 플랜

작업을 시작하기 전에 `ignore/plan.md`를 반드시 읽고, 에이전트 지시문을 따를 것. 대화 중 "플랜 파일"이라 하면 이 파일을 의미한다. 사용자가 다음 작업을 물어본다면 이 플랜 파일을 기반으로 먼저 답변할 것.
