# CLAUDE.md

This file is the root knowledge base for this monorepo.

**Generated:** 2026-02-22 00:04:03 KST  
**Commit:** `86cf506`  
**Branch:** `docs/update-claude-md`

## Overview

`missionary`는 `pnpm` 워크스페이스 기반 모노레포다. 프런트엔드 3개 패키지(디자인시스템 + 2개 Next 앱)와 백엔드 1개 NestJS 패키지로 구성된다.

## CLAUDE Hierarchy

하위 `CLAUDE.md`가 있으면 하위 규칙이 우선이고, 공통 규칙은 이 파일을 따른다.

- `./CLAUDE.md` (root, global)
- `./packages/client/CLAUDE.md` (frontend shared)
- `./packages/client/design-system/CLAUDE.md` (design system local)
- `./packages/client/missionary-app/CLAUDE.md` (app local)
- `./packages/client/missionary-admin/CLAUDE.md` (admin local)
- `./packages/server/CLAUDE.md` (backend shared)
- `./packages/server/missionary-server/CLAUDE.md` (server local)

## Structure

```text
main/
├── packages/
│   ├── client/
│   │   ├── design-system/
│   │   ├── missionary-app/
│   │   └── missionary-admin/
│   └── server/
│       └── missionary-server/
├── .github/workflows/
├── .husky/
└── eslint.config.mjs
```

## Where To Look

| Task                  | Location                               | Notes                         |
| --------------------- | -------------------------------------- | ----------------------------- |
| Workspace scripts     | `package.json`, `pnpm-workspace.yaml`  | `pnpm --filter` 중심          |
| Frontend shared rules | `packages/client/CLAUDE.md`            | Next app + DS 공통            |
| Backend shared rules  | `packages/server/CLAUDE.md`            | NestJS + Prisma 공통          |
| CI checks             | `.github/workflows/ci.yaml`            | PR: `main`, `dev`, `prod`     |
| Server deploy         | `.github/workflows/deploy-server.yaml` | `main` + `packages/server/**` |
| Git hooks             | `.husky/pre-commit`, `.husky/pre-push` | push 전 품질 게이트           |

## Non-Obvious Conventions

- Package manager는 `pnpm@10.28.1` 고정 (`packageManager` 필드).
- 루트 `pnpm test`는 없다. 테스트는 반드시 패키지 단위(`pnpm --filter <pkg> test`)로 실행한다.
- ESLint는 Flat Config(`eslint.config.mjs`)를 사용하고, 서버 코드(`packages/server/missionary-server/**`)는 Node globals 분기 규칙을 탄다.
- `import/order`는 그룹/알파벳/newline 규칙이 강제된다.
- Prettier는 `printWidth: 80`, `singleQuote: true`, `trailingComma: all`, `endOfLine: lf`를 사용한다.
- Stylelint는 SCSS 표준을 기반으로 하되 Tailwind at-rule(`theme`, `tailwind`, `apply`, `layer`, `config`, `source`)을 허용한다.
- CI는 서버 테스트를 실행하지만 프런트 테스트는 기본 PR 체인에 포함되지 않는다.

## Worktree Workflow (Mandatory)

- 이 프로젝트는 `git worktree` 기반으로 운영한다. 모든 작업은 전용 worktree에서만 수행한다.
- `main` worktree는 `main` 브랜치 전용이다. 기능 브랜치 작업 경로로 사용하지 않는다.
- 새 작업은 `scripts/wt`를 우선 사용한다 (`wt new <branch>`, `cd $(wt cd <branch>)`).
- 코드 수정, 테스트, 커밋, PR 준비는 모두 해당 기능 worktree 경로에서 실행한다.
- 잘못된 worktree에서 수정했다면 `git stash push -u`로 보관 후, 올바른 worktree에서 `git stash pop`으로 복원한다.
- PR이 머지되면 `wt rm <branch>`로 해당 worktree를 정리한다.

## Anti-Patterns

- `dev` 브랜치에 직접 push 하지 않는다. PR 필수.
- 생성 산출물(`storybook-static`, `dist`, `build`, `.next`, `coverage`)을 소스 오브 트루스로 취급하지 않는다.
- 루트에서 범용 명령으로 해결하려 하지 말고 패키지 경계(`--filter`)를 먼저 확인한다.
- `main` worktree에서 기능 브랜치 작업을 진행하지 않는다.
- bare repo 루트(`.bare`가 위치한 디렉토리)에서 코드 수정이나 pnpm 명령을 실행하지 않는다. 반드시 worktree 내에서 실행한다.

## Commands

```bash
# quality gates
pnpm lint:all
pnpm lint:fix:all
pnpm type-check

# package-focused workflows
pnpm --filter missionary-app dev
pnpm --filter missionary-admin dev
pnpm --filter design-system build
pnpm --filter missionary-server test
pnpm --filter missionary-server prisma:generate
```

## PR Convention (Global)

PR 생성 시 반드시 `.github/pull_request_template.md` 템플릿을 따른다.

필수 섹션:

1. **배경** — 이 변경이 필요한 이유
2. **변경 사항** — 주요 변경 내용 목록
3. **테스트** — 검증 방법
4. **스크린샷** — UI 변경 시 Before/After (없으면 섹션 삭제)
5. **리뷰 포인트** — 리뷰어 중점 확인 사항 (없으면 섹션 삭제)

`gh pr create` 시 `--body` 내용을 위 템플릿 구조에 맞춰 작성한다. 자체 포맷을 사용하지 않는다.

## Commit Convention (Global)

커밋 메시지 형식:

- `type(scope): subject`
- `[TICKET-ID] type(scope): subject`

규칙:

1. `subject`는 반드시 한글로 작성한다.
2. 허용 타입: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `design`, `comment`, `rename`, `remove`, `perf`, `build`, `ci`, `revert`, `hotfix`.

예시:

- `feat: 로그인 기능 구현`
- `[SMH-123] fix: 회원가입 시 이메일 중복 체크 오류 수정`
