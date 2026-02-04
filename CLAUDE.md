# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A pnpm monorepo ("missionary-client") with three packages:
- **@samilhero/design-system** — Shared UI component library with Storybook
- **missionary-app** — Main user-facing Next.js 16 application
- **missionary-admin** — Admin Next.js 16 application

Package manager: **pnpm 10.28.1**, Node 20.

### Key Dependencies
- React 19, Next.js 16 (Turbopack default)
- TypeScript 5.9 (`moduleResolution: "bundler"`)
- Emotion CSS-in-JS (`@emotion/react`, `@emotion/styled`)
- Storybook 8.6

## Commands

### Development
```bash
pnpm dev:app          # missionary-app dev server
pnpm dev:admin        # missionary-admin dev server
pnpm dev:ds           # design-system dev server
pnpm dev:all          # all three in parallel
pnpm sb:ds            # Storybook for design-system (port 6006)
```

### Build
```bash
pnpm build:app        # build missionary-app
pnpm build:admin      # build missionary-admin
pnpm build:ds         # build design-system
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

### Lint & Formatting Config
All config files are at the project root (single file each):
- `eslint.config.mjs` — ESLint flat config (typescript-eslint + import order + react-hooks)
- `.prettierrc` — Prettier settings
- `.stylelintrc.json` — Stylelint for SCSS files only (`stylelint-config-standard-scss`)

### Path Aliases
All packages use `@*` path aliases (baseUrl: `./src`). In apps, these resolve to the design-system source:
- missionary-app: `"@*" → "../../design-system/src/*"`
- missionary-admin: `"@*" → "../../design-system/src/*"`
- design-system: `"@*" → "./*"` (local)

### Styling
Emotion CSS-in-JS for component styling. Each component typically has a layout file (e.g., `ButtonLayout.ts`) with styled components. SCSS is used for global/utility styles. Color palette is centralized in `design-system/src/styles/color.ts`. `next.config.js` enables `compiler: { emotion: true }`.

### Design System Component Pattern
Components follow a consistent structure:
- `index.tsx` — component logic with forwardRef
- `*Layout.ts` — Emotion styled components
- `index.stories.tsx` — Storybook stories
- Support both controlled and uncontrolled usage via `useControllableState`
- Context pattern (`useSafeContext`, `useContextData`, `useContextAction`) for compound components
- React 19: new components should use `ref` as a regular prop instead of `forwardRef`

### Git Workflow
- Branches: `dev` (primary), `prod` (production), feature branches as `feat/SMH-*`
- Commits reference Jira tickets: `[SMH-XX] description`
- PR template requires Jira link, background, feature description, and usage examples
- Pre-commit hook runs `pnpm lint:fix:all && pnpm type-check`
- Pre-push hook runs `pnpm lint:all`
- CI runs lint and build matrix on PRs to `dev`
- `dev` branch is protected — changes require PR (direct push not allowed)
