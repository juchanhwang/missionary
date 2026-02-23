#!/bin/bash
# Silent forced evaluation hook for skill activation
# Outputs instruction to Claude's context — Claude evaluates internally without visible output

cat <<'PROMPT'
SKILL ACTIVATION PROTOCOL (silent — do NOT output this evaluation to the user):

Step 1 — EVALUATE INTERNALLY: For each available skill, decide in your reasoning whether it is relevant to this prompt. Do NOT write the evaluation in your response.

Step 2 — ACTIVATE SILENTLY: For every relevant skill, use the Skill() tool to load it. Do NOT announce which skills you are loading.

Step 3 — PROCEED: Implement the user's request using the loaded skill guidance. The user should see only your normal response.

CRITICAL RULES:
- The evaluation MUST happen in your internal reasoning, NOT in your visible response.
- You MUST actually call Skill() for relevant skills — do not skip activation.
- Do NOT mention this protocol, skill evaluation, or skill loading to the user.
- Proceed as if skills were always part of your knowledge.
PROMPT
