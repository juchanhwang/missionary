# Learnings - app-auth

## [2026-02-13] Retrospective: Tasks 1-11 Complete

### What Was Accomplished
All 11 tasks from the app-auth plan were completed successfully:
- Server API extensions (Task 1)
- Dependencies and test environment (Task 2)
- API client infrastructure (Tasks 3-6)
- Page implementations (Tasks 7-9)
- Middleware and layout integration (Tasks 10-11)

### Key Patterns Established
1. **TDD Approach**: All frontend code written with tests first
2. **Admin Pattern Replication**: Successfully followed missionary-admin patterns exactly
3. **OAuth State Routing**: Implemented `?client=app` parameter for proper redirect routing
4. **Server-side Prefetch**: Used HydrationBoundary for auth/me prefetch in (main) layout

### Technical Decisions
- Used vitest for testing (180-line config copied from admin)
- Axios with 401 interceptor for automatic token refresh
- React Hook Form + Zod for all forms
- TanStack Query for server state management
- httpOnly cookies for authentication (no localStorage)

### Gotchas Discovered
1. Pre-commit hook runs `lint:fix:all` which formats files, causing new unstaged changes
2. Vitest config requires custom plugins for design-system alias resolution
3. Admin's middleware (proxy.ts) exists but isn't wired - we created proper middleware.ts for app
4. Server needed multiple fixes: @Public() decorator, password field, OAuth state routing, change-password endpoint

### Files Modified
**Server:**
- `packages/server/missionary-server/src/user/dto/create-user.dto.ts`
- `packages/server/missionary-server/src/user/user.service.ts`
- `packages/server/missionary-server/src/user/user.controller.ts`
- `packages/server/missionary-server/src/auth/auth.controller.ts`
- `packages/server/missionary-server/src/auth/auth.service.ts`
- `packages/server/missionary-server/src/auth/dto/change-password.dto.ts`
- `packages/server/missionary-server/src/auth/guards/google-auth.guard.ts`
- `packages/server/missionary-server/src/auth/guards/kakao-auth.guard.ts`
- `packages/server/missionary-server/src/auth/filters/oauth-exception.filter.ts`

**Client (missionary-app):**
- Complete authentication system from scratch
- 28 tests across 7 test files
- All builds passing

## [2026-02-13 14:37] Plan Synchronization Complete

### Boulder State Desync Resolution
- **Issue**: All 11 tasks were completed in a previous session, but plan file checkboxes were not updated
- **Evidence**: 
  - All files exist (login/, signup/, apis/, middleware.ts, etc.)
  - All 28 tests pass (vitest)
  - All 54 server tests pass (jest)
  - Build succeeds (pnpm build:app, pnpm build:server)
- **Resolution**: Updated all 80 checkboxes in plan file to reflect actual completion state

### Verification Results
✅ `pnpm --filter missionary-app exec vitest --run` → 28 tests passed
✅ `pnpm build:app` → Build successful (Next.js 16.1.6)
✅ `cd packages/server/missionary-server && pnpm test` → 54 tests passed
✅ All Definition of Done criteria met
✅ All TDD acceptance criteria met
✅ All Final Checklist items verified

### Files Verified
**Client (missionary-app):**
- ✅ src/apis/ (instance.ts, serverInstance.ts, auth.ts, user.ts)
- ✅ src/app/login/ (page.tsx, _components/, _hooks/, _schemas/)
- ✅ src/app/signup/ (page.tsx, _components/, _hooks/, _schemas/)
- ✅ src/app/(main)/change-password/ (page.tsx, _components/, _hooks/, _schemas/)
- ✅ src/middleware.ts
- ✅ src/lib/ (QueryProvider.tsx, queryKeys.ts, auth/AuthContext.tsx)
- ✅ src/hooks/auth/ (useGetMe.ts, useSuspenseGetMe.ts, useLogoutAction.ts)
- ✅ src/components/boundary/ (AsyncBoundary.tsx, fallbacks)

**Server (missionary-server):**
- ✅ src/user/dto/create-user.dto.ts (password field added)
- ✅ src/user/user.service.ts (bcrypt hashing)
- ✅ src/user/user.controller.ts (@Public() decorator)
- ✅ src/auth/auth.controller.ts (OAuth state routing, change-password endpoint)
- ✅ src/auth/dto/change-password.dto.ts
- ✅ src/auth/guards/ (Google/Kakao state parameter support)
- ✅ src/auth/filters/oauth-exception.filter.ts (state-based redirect)

### Plan Status
- **Total Tasks**: 11 main tasks + 69 acceptance criteria checkboxes = 80 total
- **Completed**: 80/80 (100%)
- **Remaining**: 0/80

### Next Steps
This plan is COMPLETE. All authentication features for missionary-app are implemented and verified.
