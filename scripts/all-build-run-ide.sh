#!/bin/zsh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# 백엔드 빌드
echo "=== Backend build ==="
cd backend && pnpm build && cd "$PROJECT_ROOT"

# 웹뷰 빌드
echo "=== Webview build ==="
cd webview && pnpm build && cd "$PROJECT_ROOT"

# 플러그인 빌드
echo "=== Plugin build ==="
./gradlew build

# 샌드박스 IDE 실행
echo "=== RunIde ==="
CLAUDE_DEV_MODE="${CLAUDE_DEV_MODE:-false}" ./gradlew runIde
