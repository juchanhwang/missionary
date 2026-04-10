# CLAUDE.md

This file is the root knowledge base for this monorepo.

## Overview

`missionary`는 `pnpm` 워크스페이스 기반 모노레포다. 프런트엔드 3개 패키지(디자인시스템 + 2개 Next 앱)와 백엔드 1개 NestJS 패키지로 구성된다.

## CLAUDE Hierarchy

하위 `CLAUDE.md`가 있으면 하위 규칙이 우선이고, 공통 규칙은 이 파일을 따른다.

- `../docs/CLAUDE.md` (feature planning workspace, git 외부)
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

## Anti-Patterns

- `dev` 브랜치에 직접 push 하지 않는다. PR 필수.
- 생성 산출물(`storybook-static`, `dist`, `build`, `.next`, `coverage`)을 소스 오브 트루스로 취급하지 않는다.
- 루트에서 범용 명령으로 해결하려 하지 말고 패키지 경계(`--filter`)를 먼저 확인한다.

## Commands

```bash
# quality gates
pnpm lint:all
pnpm lint:fix:all
pnpm type-check
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

## Commit Convention

`commit-convention` 스킬을 따른다. 이 프로젝트의 오버라이드:

- **Subject 언어**: 한글 (코드 식별자, 기술 용어는 영문 가능)
- **티켓 prefix**: `[TICKET-ID] type(scope): subject` 형식 허용
- **추가 허용 타입**: `design`, `comment`, `rename`, `remove`

예시:
- `feat: 로그인 기능 구현`
- `[SMH-123] fix: 회원가입 시 이메일 중복 체크 오류 수정`
