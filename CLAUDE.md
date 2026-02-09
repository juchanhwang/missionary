# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A pnpm monorepo ("missionary-client") with four packages:

- **@samilhero/design-system** — Shared UI component library with Storybook
- **missionary-app** — Main user-facing Next.js 16 application
- **missionary-admin** — Admin Next.js 16 application
- **missionary-server** — NestJS 11 API server

Package manager: **pnpm 10.28.1**, Node 20.

### Key Dependencies

- React 19, Next.js 16 (Turbopack default)
- TypeScript 5.9 (`moduleResolution: "bundler"`)
- Tailwind CSS 4
- Storybook 8.6
- NestJS 11 (missionary-server, `moduleResolution: "node"`, CommonJS)
- Prisma ORM + PostgreSQL (missionary-server)

## Commands

### Development

```bash
pnpm dev:app          # missionary-app dev server
pnpm dev:admin        # missionary-admin dev server
pnpm dev:ds           # design-system dev server
pnpm dev:server       # missionary-server dev (port 3100)
pnpm dev:all          # all four in parallel
pnpm sb:ds            # Storybook for design-system (port 6006)
```

### Build

```bash
pnpm build:app        # build missionary-app
pnpm build:admin      # build missionary-admin
pnpm build:ds         # build design-system
pnpm build:server     # build missionary-server
pnpm build:all        # build all
```

### Linting & Formatting

```bash
pnpm lint:all         # ESLint + Prettier + Stylelint checks
pnpm lint:fix:all     # auto-fix all
pnpm type-check       # TypeScript type checking across packages
```

### Dependencies

```bash
pnpm add <pkg> --filter <package-name>   # add dependency to specific package
```

## Architecture

### Monorepo Structure

- `/packages/design-system/` — component library consumed by both apps
- `/packages/missionary-app/` — main app, imports design-system via `workspace:*`
- `/packages/missionary-admin/` — admin app, imports design-system via `workspace:*`
- `/packages/missionary-server/` — NestJS API server (독립 tsconfig, base 미상속)

### Lint & Formatting Config

All config files are at the project root (single file each):

- `eslint.config.mjs` — ESLint flat config (typescript-eslint + import order + react-hooks)
  - `packages/missionary-server/**`는 별도 블록: react-hooks 비활성화, `globals.node` 적용
- `.prettierrc` — Prettier settings
- `.stylelintrc.json` — Stylelint for SCSS files only (`stylelint-config-standard-scss`)

### Git Workflow

- Branches: `dev` (primary), `prod` (production), feature branches as `feat/SMH-*`
- Commits reference Jira tickets: `[SMH-XX] description`
- PR template requires Jira link, background, feature description, and usage examples
- Pre-commit hook runs `pnpm lint:fix:all && pnpm type-check`
- Pre-push hook runs `pnpm lint:all`
- CI runs lint and build matrix on PRs to `dev`
- `dev` branch is protected — changes require PR (direct push not allowed)

### Commit Message Convention (For AI Agent)

When creating commits, the AI Agent must follow these rules strictly:

**Format:** `type(scope): subject` or `[TICKET-ID] type(scope): subject`

1.  **Subject Must Be Korean**: `subject` 부분은 반드시 한글로 작성한다.
2.  **Allowed Types**:
    - `feat`: 새로운 기능 추가
    - `fix`: 버그 수정
    - `docs`: 문서 수정
    - `style`: 코드 포맷팅, 세미콜론 누락 등 코드 변경이 없는 경우
    - `refactor`: 코드 리팩토링
    - `test`: 테스트 코드, 리팩토링 테스트 코드 추가
    - `chore`: 빌드 업무 수정, 패키지 매니저 수정
    - `design`: 사용자 UI 디자인 변경
    - `comment`: 필요한 주석 추가 및 변경
    - `rename`: 파일 혹은 폴더명을 수정하거나 옮기는 경우
    - `remove`: 파일을 삭제하는 작업만 수행하는 경우
    - `perf`: 성능 개선
    - `build`: 빌드 시스템이나 외부 종속성 변경
    - `ci`: CI 설정 파일 수정
    - `revert`: 이전 커밋 되돌리기
    - `hotfix`: 급한 버그 수정

**Examples:**

- `feat: 로그인 기능 구현`
- `[SMH-123] fix: 회원가입 시 이메일 중복 체크 오류 수정`
- `design: 메인 페이지 배너 스타일 변경`

## Available Skills

Atlas must evaluate these skills for EVERY delegation:

### Client (Frontend) Skills

- **client-code-quality**: 코드 품질 4원칙 (가독성, 예측 가능성, 응집도, 결합도). **MUST USE** for complex UI logic, refactoring, code review
- **client-performance**: React 성능 최적화 (리렌더링 방지, 번들 크기, 로딩 성능)
- **client-a11y**: 웹 접근성 (스크린 리더 3요소, ARIA, 키보드 접근성)
- **client-react-state**: React 상태 관리 설계 (State Colocation, Props Drilling 해결)

### Server (Backend) Skills

- **server-api-design**: NestJS API 설계 (REST 컨벤션, DTO 검증, 에러 처리)
- **security**: 보안 코딩 (XSS, 인젝션, 인증/인가, CORS)

### Forgotten Skill Prevention

When delegating tasks, Atlas MUST:

1. Read skill descriptions above
2. Ask: "Does this skill's domain overlap with my task?"
3. If YES → Include in `load_skills=[...]`
4. If NO → Justify why in delegation prompt

**User-installed skills get PRIORITY.** When in doubt, INCLUDE rather than omit.
