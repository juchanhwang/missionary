# Client (Frontend) CLAUDE.md

> **Global Rules**: Root `CLAUDE.md`의 Code Quality Rules와 Commit Convention을 따른다.

## Technology Stack

- React 19, Next.js 16 (App Router, Turbopack)
- TypeScript 5.9 (`moduleResolution: "bundler"`)
- Tailwind CSS 4
- Storybook 8.6

## Packages

- **@samilhero/design-system** — 공유 UI 컴포넌트 라이브러리
- **missionary-app** — 메인 사용자 앱
- **missionary-admin** — 관리자 앱

## Styling

Tailwind CSS 4 for styling. Utility-first CSS framework with PostCSS integration. Global styles and theme configuration in `tailwind.config.js` and `@tailwindcss/vite` plugin for design-system. Apps use `@tailwindcss/postcss` plugin.

## Path Aliases

All packages use `@*` path aliases (baseUrl: `./src`):

- missionary-app: `"@*" → "../design-system/src/*"`
- missionary-admin: `"@*" → "../design-system/src/*"`
- design-system: `"@*" → "./*"` (local)

## Design System Component Pattern

Components follow a consistent structure:

- `index.tsx` — component logic with Tailwind utility classes
- `index.stories.tsx` — Storybook stories
- Support both controlled and uncontrolled usage via `useControllableState`
- Context pattern (`useSafeContext`, `useContextData`, `useContextAction`) for compound components
- React 19: new components should use `ref` as a regular prop instead of `forwardRef`

## Frontend App Pattern (missionary-app, missionary-admin)

Next.js App Router 기반. **라우트 코로케이션** — 도메인 코드를 해당 라우트 디렉토리에 함께 배치한다 (응집도 원칙).

**디렉토리 구조:**

```
src/
├── app/                        # Next.js App Router + 도메인 코드 코로케이션
│   ├── layout.tsx
│   └── (group)/
│       └── <route>/
│           ├── page.tsx        # 라우팅 진입점
│           ├── hooks/          # 라우트 전용 Hook
│           ├── components/     # 라우트 전용 컴포넌트
│           └── types/          # 라우트 전용 타입
├── components/                 # 공통 UI (boundary, layout 등)
├── hooks/                      # 공통 Hook
├── lib/                        # 유틸, 설정 (QueryProvider 등)
├── apis/                       # API 인스턴스, 인터셉터, API 함수
└── styles/                     # 글로벌 스타일
```

## Code Quality Rules

> **IMPORTANT**: For complex UI logic or refactoring, load the `client-code-quality` skill.
>
> 출처: https://frontend-fundamentals.com/code-quality/code/
>
> 좋은 코드란 "변경하기 쉬운 코드"이다. 4가지 원칙을 따른다:
>
> 1. **가독성 (Readability)**: 맥락 줄이기, 이름 붙이기, 위에서 아래로 읽히게
> 2. **예측 가능성 (Predictability)**: 이름 일관성, 반환 타입 통일, 숨은 로직 제거
> 3. **응집도 (Cohesion)**: 함께 수정되는 코드는 함께 위치
> 4. **결합도 (Coupling)**: 책임 분리, 중복 허용, Props Drilling 제거
>
> 상세 규칙과 Before/After 예시는 `client-code-quality` 스킬 참조.
