#!/bin/bash
# SessionStart hook: 세션 시작 시 현재 작업 컨텍스트를 자동 주입한다.
# 이 출력은 Claude Code 세션에 추가 컨텍스트로 주입된다.

set -euo pipefail

# 프로젝트 루트 찾기 (git worktree 환경 대응)
PROJECT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

echo "## Current Branch & Recent Commits"
git -C "$PROJECT_DIR" branch --show-current 2>/dev/null || echo "(detached HEAD)"
git -C "$PROJECT_DIR" log --oneline -5 2>/dev/null || echo "(no commits)"

echo ""
echo "## Active PRs"
gh pr list --author "@me" --state open --limit 5 2>/dev/null || echo "(gh CLI unavailable or no open PRs)"

echo ""
echo "## Latest Feature Docs"
DOCS_DIR="/Users/JuChan/Documents/FE/missionary/docs"
if [ -d "$DOCS_DIR" ]; then
  ls -1td "$DOCS_DIR"/*/ 2>/dev/null | head -3 | while read -r dir; do
    basename "$dir"
  done
else
  echo "(docs directory not found)"
fi
