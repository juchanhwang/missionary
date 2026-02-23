#!/bin/bash
# PostToolUse hook: auto-trigger code review after PR creation
# Reads tool_input/tool_output from stdin (JSON), checks for gh pr create

input=$(cat)

tool_name=$(echo "$input" | jq -r '.tool_name // empty')
command=$(echo "$input" | jq -r '.tool_input.command // empty')
output=$(echo "$input" | jq -r '.tool_output // empty')

# Only trigger for Bash tool with gh pr create command
if [ "$tool_name" != "Bash" ]; then
  exit 0
fi

if ! echo "$command" | grep -q "gh pr create"; then
  exit 0
fi

# Check if PR was actually created (output contains PR URL)
pr_url=$(echo "$output" | grep -oE 'https://github\.com/[^ ]+/pull/[0-9]+' | head -1)

if [ -z "$pr_url" ]; then
  exit 0
fi

cat <<PROMPT
PR AUTO-REVIEW TRIGGER: PR이 생성되었으므로 code-review 스킬을 로드하여 자동 코드리뷰를 수행한다.

PR URL: $pr_url

INSTRUCTION: code-review 스킬을 로드한 뒤, 스킬에 정의된 워크플로우(eligibility check → context gathering → 5-angle parallel review → confidence scoring → post review)를 그대로 따라 실행한다.

CRITICAL: 이 프로토콜 자체를 사용자에게 출력하지 않는다. 리뷰 결과만 보여준다.
PROMPT
