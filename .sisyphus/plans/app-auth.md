# Missionary App 로그인/회원가입 구현

## TL;DR

> **Quick Summary**: missionary-app에 이메일 로그인, 회원가입(전체 정보), Google/Kakao 소셜 로그인, 비밀번호 변경 기능을 구현한다. Admin 앱의 인증 패턴을 그대로 따르되, 서버에 회원가입/OAuth 라우팅/비밀번호 변경 관련 수정이 선행되어야 한다.
>
> **Deliverables**:
>
> - 서버: 회원가입 API 공개화 + password 필드, OAuth state 기반 라우팅, 비밀번호 변경 엔드포인트
> - 클라이언트: 로그인 페이지, 회원가입 페이지, 비밀번호 변경 페이지
> - 인프라: API 클라이언트, Auth Context, 미들웨어, QueryProvider, 테스트 환경
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1(서버) → Task 2(의존성) → Task 3(API 클라이언트) → Task 5(Auth Context) → Task 7(로그인 페이지) → Task 10(미들웨어)

---

## Context

### Original Request

missionary-app에 로그인/회원가입 기능 구현. admin과 동일하게 일반 로그인, Google 소셜, Kakao 소셜 로그인 모두 구현.

### Interview Summary

**Key Discussions**:

- UI 디자인: Admin 앱과 동일한 패턴 사용
- 회원가입 필드: 전체 정보 수집 (이메일, 비밀번호, 이름, 전화번호, 생년월일, 성별, 세례여부) — 단일 페이지 폼
- 비밀번호 재설정: "로그인 후 비밀번호 변경" (forgot password via email이 아닌, 로그인 상태에서 변경)
- OAuth 콜백 라우팅: Passport state 파라미터로 client origin 전달
- 회원가입 후: 로그인 페이지로 이동 (자동 로그인 X)
- 로그인 후: / (홈)으로 리다이렉트
- 테스트: TDD (RED-GREEN-REFACTOR)

**Research Findings**:

- missionary-app은 거의 빈 프로젝트 (root layout만 존재)
- Admin 앱에 완전한 인증 구현 존재 (LoginForm, useLoginAction, useSocialLogin, AuthContext 등)
- 서버 Auth API 완전 문서화 (POST /auth/login, GET /auth/me, POST /auth/refresh 등)
- 디자인 시스템에 InputField, Button, Checkbox, Select, DatePicker 등 사용 가능
- 서버에 `POST /users`는 `@Public()` 없음 (비로그인 접근 불가) — 수정 필요
- 서버 `CreateUserDto`에 password 필드 없음 — 수정 필요
- OAuth 콜백이 ADMIN_CLIENT_URL로 하드코딩 — state 파라미터 방식으로 수정 필요

### Metis Review

**Identified Gaps** (addressed):

- POST /users에 @Public() 없음 → Task 1에서 수정
- CreateUserDto에 password 없음 → Task 1에서 추가
- OAuth 콜백 하드코딩 → Task 1에서 state 파라미터 방식으로 수정
- 비밀번호 변경 엔드포인트 없음 → Task 1에서 추가
- 테스트 인프라 없음 → Task 2에서 설정
- middleware.ts 패턴 확인 → Admin의 proxy.ts는 Next.js middleware 패턴. missionary-app에서는 middleware.ts로 생성

---

## Work Objectives

### Core Objective

missionary-app에 완전한 인증 시스템 구축: 이메일 로그인, 전체 정보 회원가입, Google/Kakao 소셜 로그인, 비밀번호 변경, 라우트 보호.

### Concrete Deliverables

- 서버: @Public() + password 필드 + OAuth state 라우팅 + 비밀번호 변경 엔드포인트
- `packages/client/missionary-app/src/apis/` — API 클라이언트 (instance, auth, user)
- `packages/client/missionary-app/src/app/login/` — 로그인 페이지
- `packages/client/missionary-app/src/app/signup/` — 회원가입 페이지
- `packages/client/missionary-app/src/app/(main)/` — 인증된 라우트 그룹
- `packages/client/missionary-app/src/app/(main)/change-password/` — 비밀번호 변경 페이지
- `packages/client/missionary-app/src/lib/` — QueryProvider, AuthContext, queryKeys
- `packages/client/missionary-app/src/hooks/auth/` — 인증 관련 hooks
- `packages/client/missionary-app/src/components/boundary/` — AsyncBoundary, fallback 컴포넌트
- `packages/client/missionary-app/src/middleware.ts` — 라우트 보호 미들웨어

### Definition of Done

- [x] 이메일/비밀번호 로그인 성공 시 / 로 리다이렉트
- [x] 회원가입 후 로그인 페이지로 리다이렉트
- [x] Google OAuth 로그인 플로우 완동
- [x] Kakao OAuth 로그인 플로우 완동
- [x] 비인증 사용자 → /login 리다이렉트
- [x] 인증 사용자가 /login 접근 → / 리다이렉트
- [x] 비밀번호 변경 기능 동작
- [x] 로그아웃 기능 동작
- [x] 모든 TDD 테스트 통과

### Must Have

- Admin 패턴과 동일한 아키텍처 (RHF + Zod, TanStack Query, Axios 인터셉터, AuthContext)
- httpOnly 쿠키 기반 인증 (서버와 일치)
- 401 인터셉터 + 토큰 자동 갱신
- 서버사이드 auth/me 프리페치 (HydrationBoundary)

### Must NOT Have (Guardrails)

- missionary-admin 코드를 수정하지 않는다
- 디자인 시스템에 새 컴포넌트를 추가하지 않는다 (기존 컴포넌트만 사용)
- 이메일 인증/발송 기능을 추가하지 않는다
- 기존 서버 OAuth 전략을 리팩토링하지 않는다 (확장만)
- 회원가입 시 이메일 인증 절차를 추가하지 않는다
- 쿠키 설정(domain, path, secure)을 변경하지 않는다

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision

- **Infrastructure exists**: NO (설치 필요)
- **Automated tests**: TDD (RED-GREEN-REFACTOR)
- **Framework**: vitest (Next.js 16 + React 19 호환)

### TDD Structure

Each frontend TODO follows RED-GREEN-REFACTOR:

1. **RED**: 테스트 파일 먼저 작성 → 실행 시 FAIL
2. **GREEN**: 최소 구현으로 테스트 통과
3. **REFACTOR**: 테스트 통과 유지하면서 코드 정리

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

모든 태스크에 Playwright, curl, 또는 interactive_bash 기반 QA 시나리오 포함.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: 서버 수정 (Auth API 확장)
└── Task 2: missionary-app 의존성 + 테스트 환경 설정

Wave 2 (After Wave 1):
├── Task 3: API 클라이언트 (instance, interceptor)
├── Task 4: QueryProvider + queryKeys
├── Task 5: Auth Context + hooks
└── Task 6: Boundary 컴포넌트

Wave 3 (After Wave 2):
├── Task 7: 로그인 페이지
├── Task 8: 회원가입 페이지
└── Task 9: 비밀번호 변경 페이지

Wave 4 (After Wave 3):
├── Task 10: 미들웨어 + 라우트 보호
└── Task 11: 레이아웃 통합 (root + (main) 그룹)

Critical Path: Task 1 → Task 3 → Task 5 → Task 7 → Task 10 → Task 11
Parallel Speedup: ~50% faster than sequential
```

### Dependency Matrix

| Task | Depends On  | Blocks              | Can Parallelize With |
| ---- | ----------- | ------------------- | -------------------- |
| 1    | None        | 3, 7, 8, 9          | 2                    |
| 2    | None        | 3, 4, 5, 6, 7, 8, 9 | 1                    |
| 3    | 1, 2        | 5, 7, 8, 9          | 4, 6                 |
| 4    | 2           | 5, 7, 8, 9, 11      | 3, 6                 |
| 5    | 3, 4        | 7, 9, 11            | 6                    |
| 6    | 2           | 7, 8, 11            | 3, 4, 5              |
| 7    | 5, 6        | 10                  | 8                    |
| 8    | 3, 6        | 10                  | 7, 9                 |
| 9    | 5           | 10                  | 7, 8                 |
| 10   | 7, 8, 9     | 11                  | None                 |
| 11   | 4, 5, 6, 10 | None                | None (final)         |

### Agent Dispatch Summary

| Wave | Tasks      | Recommended Agents                                         |
| ---- | ---------- | ---------------------------------------------------------- |
| 1    | 1, 2       | task(category="unspecified-high") / task(category="quick") |
| 2    | 3, 4, 5, 6 | dispatch parallel (4 tasks)                                |
| 3    | 7, 8, 9    | dispatch parallel (3 tasks)                                |
| 4    | 10, 11     | sequential                                                 |

---

## TODOs

- [x] 1. 서버 Auth API 확장 (회원가입 공개 + OAuth state 라우팅 + 비밀번호 변경)

  **What to do**:
  - `CreateUserDto`에 `password` 필드 추가 (`@IsString() @IsNotEmpty() @MinLength(8)`)
  - `UserService.create()`에서 password를 bcrypt.hash()로 해싱 후 저장
  - `UserController.create()`에 `@Public()` 데코레이터 추가
  - `APP_CLIENT_URL` 환경변수 추가 (`.env.example`, `config validation`)
  - Google/Kakao OAuth 전략에 `state` 파라미터 추가: OAuth 시작 시 `?client=app` 또는 `?client=admin` 쿼리를 받아 `state`로 전달
  - `AuthController`의 `googleCallback()`, `kakaoCallback()`에서 `state` 파라미터를 읽어 `APP_CLIENT_URL` 또는 `ADMIN_CLIENT_URL`로 분기 리다이렉트
  - `OAuthExceptionFilter`에서도 `state` 파라미터 기반 에러 리다이렉트 URL 분기
  - 새 엔드포인트: `PATCH /auth/change-password` — 현재 비밀번호 + 새 비밀번호 받아서 변경
    - `ChangePasswordDto`: `{ currentPassword: string, newPassword: string }`
    - JWT 인증 필요 (로그인 상태)
    - 현재 비밀번호 bcrypt.compare() 검증 후 새 비밀번호 해싱 저장
  - 서버 테스트 작성: 회원가입 API, 비밀번호 변경 API, OAuth state 라우팅

  **Must NOT do**:
  - 기존 admin 로그인 로직 변경 금지
  - 기존 OAuth 전략 클래스 구조를 리팩토링하지 않음 (확장만)
  - 이메일 인증/발송 기능 추가 금지

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: NestJS 서버 코드 수정, DTO/Service/Controller/Guard/Filter 다수 파일 변경
  - **Skills**: [`nestjs-expert`, `api-design`, `security`]
    - `nestjs-expert`: NestJS 가드, 전략, 데코레이터, 필터 수정에 전문 지식 필요
    - `api-design`: DTO 검증, 엔드포인트 설계 규칙
    - `security`: bcrypt 해싱, 비밀번호 변경 보안 규칙
  - **Skills Evaluated but Omitted**:
    - `client-code-quality`: 프론트엔드 전용이므로 서버에 불필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 7, 8, 9
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL):

  **Pattern References**:
  - `packages/server/missionary-server/src/auth/auth.controller.ts:64-78` — 기존 로그인 엔드포인트 패턴 (데코레이터, 가드, 응답 형식)
  - `packages/server/missionary-server/src/auth/auth.controller.ts:108-118` — Google OAuth 콜백 (현재 ADMIN_CLIENT_URL 하드코딩 → state 기반으로 변경)
  - `packages/server/missionary-server/src/auth/auth.controller.ts:134-144` — Kakao OAuth 콜백 (동일 변경)
  - `packages/server/missionary-server/src/auth/filters/oauth-exception.filter.ts:53-59` — OAuth 에러 리다이렉트 (ADMIN_CLIENT_URL → state 기반)
  - `packages/server/missionary-server/src/auth/auth.service.ts` — 토큰 생성, 인증 로직 패턴

  **API/Type References**:
  - `packages/server/missionary-server/src/user/dto/create-user.dto.ts` — 현재 DTO (password 필드 없음 → 추가 필요)
  - `packages/server/missionary-server/src/user/user.service.ts:46-63` — create() 메서드 (bcrypt 해싱 로직 추가 위치)
  - `packages/server/missionary-server/src/user/user.controller.ts:25-29` — @Public() 데코레이터 추가 위치
  - `packages/server/missionary-server/src/common/decorators/public.decorator.ts` — @Public() 데코레이터 import 경로
  - `packages/server/missionary-server/src/auth/dto/login.dto.ts` — 기존 DTO 패턴 참고

  **Documentation References**:
  - `packages/server/missionary-server/.env.example` — 환경변수 추가 위치
  - `packages/server/CLAUDE.md` — NestJS 서버 패턴 가이드

  **Acceptance Criteria**:

  **TDD:**
  - [x] 테스트: POST /users 비인증 요청 → 201 (password 포함)
  - [x] 테스트: POST /users 중복 이메일 → 409
  - [x] 테스트: 생성된 유저로 POST /auth/login → 성공
  - [x] 테스트: PATCH /auth/change-password 올바른 현재 비밀번호 → 200
  - [x] 테스트: PATCH /auth/change-password 틀린 현재 비밀번호 → 401
  - [x] 테스트: OAuth 콜백 state=app → APP_CLIENT_URL 리다이렉트
  - [x] 테스트: OAuth 콜백 state=admin → ADMIN_CLIENT_URL 리다이렉트
  - [x] 서버 빌드: `pnpm build:server` → 성공

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 비인증 회원가입 API 호출 성공
    Tool: Bash (curl)
    Preconditions: 서버 실행 중 (localhost:3100)
    Steps:
      1. curl -s -w "\n%{http_code}" -X POST http://localhost:3100/users \
           -H "Content-Type: application/json" \
           -d '{"email":"test-signup@test.com","password":"TestPass123!","name":"테스트"}'
      2. Assert: HTTP status is 201
      3. Assert: response.email equals "test-signup@test.com"
      4. curl -s -w "\n%{http_code}" -X POST http://localhost:3100/auth/login \
           -H "Content-Type: application/json" \
           -d '{"email":"test-signup@test.com","password":"TestPass123!"}'
      5. Assert: HTTP status is 200
      6. Assert: response.message equals "로그인 성공"
    Expected Result: 회원가입 후 로그인 가능
    Evidence: Response bodies captured

  Scenario: 비밀번호 변경 성공
    Tool: Bash (curl)
    Preconditions: 서버 실행 중, test 유저 로그인 상태 (access_token 쿠키)
    Steps:
      1. 로그인하여 쿠키 획득: curl -s -c cookies.txt -X POST http://localhost:3100/auth/login ...
      2. curl -s -w "\n%{http_code}" -b cookies.txt -X PATCH http://localhost:3100/auth/change-password \
           -H "Content-Type: application/json" \
           -d '{"currentPassword":"TestPass123!","newPassword":"NewPass456!"}'
      3. Assert: HTTP status is 200
      4. 새 비밀번호로 로그인 성공 확인
    Expected Result: 비밀번호 변경 후 새 비밀번호로 로그인
    Evidence: Response bodies captured
  ```

  **Commit**: YES
  - Message: `feat(server): 회원가입 공개 API, OAuth state 라우팅, 비밀번호 변경 엔드포인트 추가`
  - Files: `packages/server/missionary-server/src/auth/`, `packages/server/missionary-server/src/user/`
  - Pre-commit: `pnpm build:server`

---

- [x] 2. missionary-app 의존성 설치 + 테스트 환경 설정

  **What to do**:
  - 의존성 설치 (pnpm add --filter missionary-app):
    - `axios` — HTTP 클라이언트
    - `@tanstack/react-query` — 서버 상태 관리
    - `react-hook-form` — 폼 관리
    - `@hookform/resolvers` — Zod 리졸버
    - `zod` — 스키마 검증
    - `server-only` — 서버 전용 모듈 보호
  - 테스트 의존성 설치 (pnpm add -D --filter missionary-app):
    - `vitest` — 테스트 러너
    - `@testing-library/react` — React 컴포넌트 테스트
    - `@testing-library/jest-dom` — DOM 매처
    - `@testing-library/user-event` — 사용자 이벤트 시뮬레이션
    - `jsdom` — DOM 환경
    - `@vitejs/plugin-react` — Vitest React 지원
  - `vitest.config.ts` 생성 (Admin 앱 패턴 참조)
  - `src/test/setup.ts` 생성 (testing-library jest-dom 확장)
  - package.json에 test 스크립트 추가
  - `.env.example` 업데이트: `NEXT_PUBLIC_API_URL=http://localhost:3100`

  **Must NOT do**:
  - 다른 패키지의 의존성을 변경하지 않음
  - next-auth를 사용하지 않음 (커스텀 인증)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 의존성 설치와 설정 파일 생성으로 단순 작업
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `nestjs-expert`: 프론트엔드 패키지이므로 불필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 3, 4, 5, 6, 7, 8, 9
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/package.json` — Admin 의존성 목록 참조 (동일 버전 사용)
  - `packages/client/missionary-admin/vitest.config.ts` — 테스트 설정 패턴 (있다면)

  **API/Type References**:
  - `packages/client/missionary-app/package.json` — 현재 의존성 상태
  - `packages/client/missionary-app/.env.example` — 환경변수 템플릿

  **Acceptance Criteria**:
  - [x] `pnpm --filter missionary-app exec vitest --run` → 테스트 환경 동작 확인
  - [x] `pnpm build:app` → 빌드 성공 (의존성 추가 후 에러 없음)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 테스트 환경 동작 확인
    Tool: Bash
    Preconditions: 의존성 설치 완료
    Steps:
      1. pnpm --filter missionary-app exec vitest --run
      2. Assert: 프로세스 종료 코드 0
      3. Assert: 출력에 "tests" 관련 텍스트 포함
    Expected Result: vitest가 정상 실행됨
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `chore(app): 인증 기능 의존성 및 테스트 환경 설정`
  - Files: `packages/client/missionary-app/package.json`, `vitest.config.ts`, `src/test/setup.ts`
  - Pre-commit: `pnpm build:app`

---

- [x] 3. API 클라이언트 (Axios instance + 인터셉터 + Auth API)

  **What to do**:
  - TDD: 테스트 먼저 작성
  - `src/apis/instance.ts` — Axios 인스턴스 생성
    - baseURL: `process.env.NEXT_PUBLIC_API_URL`
    - withCredentials: true (쿠키 전송)
    - 401 응답 인터셉터: refresh 시도 → 실패 시 /login 리다이렉트
    - Admin의 `instance.ts` 패턴 그대로 따름
  - `src/apis/serverInstance.ts` — 서버사이드 전용 API 인스턴스
    - `server-only` import로 클라이언트 번들 방지
    - next/headers의 cookies()로 쿠키 전달
    - Admin의 `serverInstance.ts` 패턴 따름
  - `src/apis/auth.ts` — Auth API 함수들
    - `authApi.login(email, password)` → POST /auth/login
    - `authApi.logout()` → POST /auth/logout
    - `authApi.getMe()` → GET /auth/me
    - `authApi.refresh()` → POST /auth/refresh
    - `authApi.changePassword(currentPassword, newPassword)` → PATCH /auth/change-password
    - `AuthUser` 인터페이스 정의
  - `src/apis/user.ts` — User API 함수들
    - `userApi.signup(data)` → POST /users
    - `SignupData` 인터페이스 정의

  **Must NOT do**:
  - fetch API 대신 반드시 axios 사용 (Admin 패턴 일치)
  - 쿠키 설정을 직접 조작하지 않음 (서버가 httpOnly로 관리)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Admin 코드를 거의 그대로 복제 + 확장하는 작업
  - **Skills**: [`client-code-quality`]
    - `client-code-quality`: API 클라이언트 코드 품질 보장
  - **Skills Evaluated but Omitted**:
    - `nestjs-expert`: 프론트엔드 코드이므로 불필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6)
  - **Blocks**: Tasks 5, 7, 8, 9
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/apis/instance.ts` — Axios 인스턴스 + 401 인터셉터 패턴 (전체 파일)
  - `packages/client/missionary-admin/src/apis/serverInstance.ts` — 서버사이드 API 인스턴스 패턴 (전체 파일)
  - `packages/client/missionary-admin/src/apis/auth.ts` — Auth API 함수 패턴 (authApi 객체 구조, AuthUser 인터페이스)

  **API/Type References**:
  - 서버 엔드포인트: POST /auth/login, GET /auth/me, POST /auth/refresh, POST /auth/logout, PATCH /auth/change-password, POST /users
  - `packages/server/missionary-server/src/auth/dto/login.dto.ts` — 요청 형식
  - `packages/server/missionary-server/src/user/dto/create-user.dto.ts` — 회원가입 요청 형식

  **Acceptance Criteria**:

  **TDD:**
  - [x] 테스트: instance가 NEXT_PUBLIC_API_URL을 baseURL로 사용
  - [x] 테스트: 401 인터셉터가 refresh 호출 후 원래 요청 재시도
  - [x] 테스트: authApi.login() 호출 시 POST /auth/login에 올바른 body 전달
  - [x] 테스트: userApi.signup() 호출 시 POST /users에 올바른 body 전달
  - [x] vitest 실행 → PASS

  **Commit**: YES
  - Message: `feat(app): API 클라이언트 및 인증/유저 API 모듈 구현`
  - Files: `packages/client/missionary-app/src/apis/`
  - Pre-commit: `pnpm --filter missionary-app exec vitest --run`

---

- [x] 4. QueryProvider + queryKeys 설정

  **What to do**:
  - TDD: 테스트 먼저 작성
  - `src/lib/QueryProvider.tsx` — QueryClientProvider 래퍼
    - `'use client'` 지시어
    - defaultOptions 설정 (Admin 패턴 따름)
  - `src/lib/queryKeys.ts` — React Query 키 팩토리
    - `queryKeys.auth.me()` → ['auth', 'me']
    - 향후 확장 가능한 구조

  **Must NOT do**:
  - QueryClient를 글로벌 변수로 생성하지 않음 (컴포넌트 내에서 생성)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 2개 파일 생성, Admin 코드를 거의 복사
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5, 6)
  - **Blocks**: Tasks 5, 7, 8, 9, 11
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/lib/QueryProvider.tsx` — QueryProvider 구현 패턴 (전체 파일)
  - `packages/client/missionary-admin/src/lib/queryKeys.ts` — queryKeys 팩토리 패턴 (전체 파일)

  **Acceptance Criteria**:

  **TDD:**
  - [x] 테스트: QueryProvider가 children을 렌더링
  - [x] 테스트: queryKeys.auth.me()가 ['auth', 'me'] 반환
  - [x] vitest 실행 → PASS

  **Commit**: YES (groups with Task 3)
  - Message: `feat(app): QueryProvider 및 queryKeys 설정`
  - Files: `packages/client/missionary-app/src/lib/QueryProvider.tsx`, `queryKeys.ts`

---

- [x] 5. Auth Context + Auth Hooks

  **What to do**:
  - TDD: 테스트 먼저 작성
  - `src/lib/auth/AuthContext.tsx` — AuthProvider + useAuth hook
    - `useSuspenseGetMe()`로 유저 데이터 로드
    - `useAuth()`: `{ user, logout }` 반환
    - Provider 외부에서 useAuth() 호출 시 에러
  - `src/hooks/auth/index.ts` — barrel export
  - `src/hooks/auth/useGetMe.ts` — useQuery로 GET /auth/me (retry: false)
  - `src/hooks/auth/useSuspenseGetMe.ts` — useSuspenseQuery로 GET /auth/me
  - `src/hooks/auth/useLogoutAction.ts` — useMutation으로 POST /auth/logout → 캐시 초기화 + /login 리다이렉트

  **Must NOT do**:
  - zustand 등 별도 상태 관리 라이브러리 사용 금지 (React Context만)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Admin 패턴 복제 작업
  - **Skills**: [`client-react-state`]
    - `client-react-state`: React 상태 관리 패턴

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4, 6) — but depends on 3, 4 completing
  - **Blocks**: Tasks 7, 9, 11
  - **Blocked By**: Tasks 3, 4

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/lib/auth/AuthContext.tsx` — AuthContext 구현 (전체 파일) — useSuspenseGetMe, useAuth, logout 로직
  - `packages/client/missionary-admin/src/hooks/auth/useGetMe.ts` — useQuery 패턴
  - `packages/client/missionary-admin/src/hooks/auth/useSuspenseGetMe.ts` — useSuspenseQuery 패턴
  - `packages/client/missionary-admin/src/hooks/auth/useLogoutAction.ts` — 로그아웃 mutation 패턴
  - `packages/client/missionary-admin/src/hooks/auth/index.ts` — barrel export 패턴

  **Acceptance Criteria**:

  **TDD:**
  - [x] 테스트: AuthProvider가 user 데이터를 children에 전달
  - [x] 테스트: useAuth()가 Provider 외부에서 에러 throw
  - [x] 테스트: useLogoutAction이 authApi.logout() 호출
  - [x] vitest 실행 → PASS

  **Commit**: YES
  - Message: `feat(app): Auth Context 및 인증 hooks 구현`
  - Files: `packages/client/missionary-app/src/lib/auth/`, `src/hooks/auth/`

---

- [x] 6. Boundary 컴포넌트 (AsyncBoundary + Fallbacks)

  **What to do**:
  - TDD: 테스트 먼저 작성
  - `src/components/boundary/AsyncBoundary.tsx` — ErrorBoundary + Suspense 래퍼
  - `src/components/boundary/AuthErrorFallback.tsx` — 인증 에러 시 표시할 fallback
  - `src/components/boundary/AuthLoadingFallback.tsx` — 인증 로딩 중 fallback

  **Must NOT do**:
  - react-error-boundary 외부 라이브러리 사용 금지 (Admin과 동일하게 직접 구현 또는 react-error-boundary 사용)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Admin 코드 복제, 3개 간단한 컴포넌트
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4, 5)
  - **Blocks**: Tasks 7, 8, 11
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/components/boundary/AsyncBoundary.tsx` — AsyncBoundary 구현 패턴 (전체 파일)
  - `packages/client/missionary-admin/src/components/boundary/AuthErrorFallback.tsx` — 에러 fallback 패턴 (전체 파일)
  - `packages/client/missionary-admin/src/components/boundary/AuthLoadingFallback.tsx` — 로딩 fallback 패턴 (전체 파일)

  **Acceptance Criteria**:

  **TDD:**
  - [x] 테스트: AsyncBoundary가 에러 시 errorFallback 렌더링
  - [x] 테스트: AsyncBoundary가 로딩 시 loadingFallback 렌더링
  - [x] vitest 실행 → PASS

  **Commit**: YES (groups with Task 5)
  - Message: `feat(app): Boundary 컴포넌트 (AsyncBoundary, Fallbacks) 구현`
  - Files: `packages/client/missionary-app/src/components/boundary/`

---

- [x] 7. 로그인 페이지

  **What to do**:
  - TDD: 테스트 먼저 작성
  - `src/app/login/page.tsx` — 로그인 페이지 엔트리 (AsyncBoundary로 감싸기)
  - `src/app/login/_components/LoginForm.tsx` — 로그인 폼
    - React Hook Form + Zod 검증
    - 이메일/비밀번호 InputField
    - 로그인 버튼 (Button)
    - Google/Kakao 소셜 로그인 버튼
    - Admin 로그인 폼과 동일한 레이아웃
    - 타이틀/설명 텍스트만 missionary-app용으로 변경
    - 하단에 "회원가입" 링크 추가
  - `src/app/login/_schemas/loginSchema.ts` — Zod 검증 스키마
  - `src/app/login/_hooks/useLoginAction.ts` — 로그인 mutation (성공 시 / 리다이렉트)
  - `src/app/login/_hooks/useSocialLogin.ts` — Google/Kakao OAuth 트리거
    - `loginGoogle()`: `${API_URL}/auth/google?client=app` 으로 리다이렉트 (state 파라미터 전달)
    - `loginKakao()`: `${API_URL}/auth/kakao?client=app` 으로 리다이렉트
  - `src/app/login/_hooks/useOAuthError.ts` — OAuth 에러 핸들링
  - `src/app/login/layout.tsx` — 로그인 페이지 전용 레이아웃 (선택적)

  **Must NOT do**:
  - 디자인 시스템에 새 컴포넌트 추가 금지
  - admin/login 코드를 import하지 않음 (복제 후 수정)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 컴포넌트 작성, 폼 레이아웃, 디자인 시스템 컴포넌트 조합
  - **Skills**: [`frontend-ui-ux`, `client-code-quality`]
    - `frontend-ui-ux`: UI/UX 품질 보장
    - `client-code-quality`: 폼 로직 코드 품질
  - **Skills Evaluated but Omitted**:
    - `client-a11y`: 디자인 시스템 컴포넌트가 이미 접근성 지원

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 5, 6

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/app/login/page.tsx` — 로그인 페이지 엔트리 패턴 (전체 파일)
  - `packages/client/missionary-admin/src/app/login/_components/LoginForm.tsx` — 로그인 폼 구현 (전체 파일 — UI 구조, RHF 연동, 소셜 버튼)
  - `packages/client/missionary-admin/src/app/login/_schemas/loginSchema.ts` — Zod 스키마 패턴
  - `packages/client/missionary-admin/src/app/login/_hooks/useLoginAction.ts` — 로그인 mutation 패턴
  - `packages/client/missionary-admin/src/app/login/_hooks/useSocialLogin.ts` — 소셜 로그인 트리거 패턴 (URL 변경 필요: `?client=app` 추가)
  - `packages/client/missionary-admin/src/app/login/_hooks/useOAuthError.ts` — OAuth 에러 핸들링 패턴

  **API/Type References**:
  - POST /auth/login — `{ email: string, password: string }` → `{ message: "로그인 성공" }`
  - GET /auth/google?client=app — Google OAuth 시작
  - GET /auth/kakao?client=app — Kakao OAuth 시작

  **Acceptance Criteria**:

  **TDD:**
  - [x] 테스트: LoginForm 렌더링 (이메일, 비밀번호 필드, 로그인 버튼 존재)
  - [x] 테스트: 빈 필드 제출 시 검증 에러 표시
  - [x] 테스트: 유효한 데이터 제출 시 loginMutation.mutate() 호출
  - [x] 테스트: loginSchema — 유효한 데이터 통과, 빈 필드 거부, 잘못된 이메일 거부
  - [x] vitest 실행 → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 이메일/비밀번호 로그인 성공
    Tool: Playwright (playwright skill)
    Preconditions: 서버 실행 중, dev 서버 실행 중 (localhost:3000), 테스트 유저 존재
    Steps:
      1. Navigate to: http://localhost:3000/login
      2. Wait for: input[name="email"] visible (timeout: 5s)
      3. Fill: input[name="email"] → "test@example.com"
      4. Fill: input[name="password"] → "TestPass123!"
      5. Click: button[type="submit"]
      6. Wait for: navigation to / (timeout: 10s)
      7. Assert: URL is http://localhost:3000/
      8. Screenshot: .sisyphus/evidence/task-7-login-success.png
    Expected Result: 홈 페이지로 리다이렉트
    Evidence: .sisyphus/evidence/task-7-login-success.png

  Scenario: 잘못된 비밀번호 에러 표시
    Tool: Playwright (playwright skill)
    Preconditions: 서버 실행 중, dev 서버 실행 중
    Steps:
      1. Navigate to: http://localhost:3000/login
      2. Fill: input[name="email"] → "test@example.com"
      3. Fill: input[name="password"] → "WrongPass"
      4. Click: button[type="submit"]
      5. Wait for: error message visible (timeout: 5s)
      6. Assert: 텍스트 "이메일 또는 비밀번호가 올바르지 않습니다" 표시
      7. Assert: URL is still /login
      8. Screenshot: .sisyphus/evidence/task-7-login-failure.png
    Expected Result: 에러 메시지 표시, 페이지 유지
    Evidence: .sisyphus/evidence/task-7-login-failure.png

  Scenario: Google 소셜 로그인 버튼 동작
    Tool: Playwright (playwright skill)
    Preconditions: dev 서버 실행 중
    Steps:
      1. Navigate to: http://localhost:3000/login
      2. Click: Google 로그인 버튼
      3. Assert: 현재 URL이 accounts.google.com 또는 localhost:3100/auth/google 포함
    Expected Result: Google OAuth 페이지로 리다이렉트
    Evidence: .sisyphus/evidence/task-7-google-oauth.png

  Scenario: OAuth 에러 파라미터 처리
    Tool: Playwright (playwright skill)
    Preconditions: dev 서버 실행 중
    Steps:
      1. Navigate to: http://localhost:3000/login?error=OAuth%20인증%20실패
      2. Wait for: 에러 메시지 visible (timeout: 5s)
      3. Assert: "소셜 로그인에 실패했습니다" 메시지 표시
      4. Screenshot: .sisyphus/evidence/task-7-oauth-error.png
    Expected Result: OAuth 에러 메시지 표시
    Evidence: .sisyphus/evidence/task-7-oauth-error.png
  ```

  **Commit**: YES
  - Message: `feat(app): 로그인 페이지 구현 (이메일/비밀번호 + 소셜 로그인)`
  - Files: `packages/client/missionary-app/src/app/login/`
  - Pre-commit: `pnpm --filter missionary-app exec vitest --run`

---

- [x] 8. 회원가입 페이지

  **What to do**:
  - TDD: 테스트 먼저 작성
  - `src/app/signup/page.tsx` — 회원가입 페이지 엔트리 (AsyncBoundary)
  - `src/app/signup/_components/SignupForm.tsx` — 회원가입 폼
    - React Hook Form + Zod 검증
    - 필수: 이메일, 비밀번호, 비밀번호 확인
    - 선택: 이름, 전화번호, 생년월일(DatePicker), 성별(Select), 세례여부(Checkbox), 세례일(DatePicker, 조건부)
    - 단일 페이지 폼
    - 회원가입 버튼 (Button)
    - 하단에 "로그인으로 돌아가기" 링크
  - `src/app/signup/_schemas/signupSchema.ts` — Zod 검증 스키마
    - email: 이메일 형식 필수
    - password: 최소 8자 필수
    - passwordConfirm: password와 일치 검증
    - name, phoneNumber, gender: optional string
    - birthDate: optional date
    - isBaptized: optional boolean
    - baptizedAt: isBaptized=true일 때만 optional date
  - `src/app/signup/_hooks/useSignupAction.ts` — 회원가입 mutation
    - userApi.signup() 호출
    - 성공: /login으로 리다이렉트 + 성공 메시지
    - 409 에러: "이미 존재하는 이메일입니다" 폼 에러

  **Must NOT do**:
  - 이메일 인증 절차 추가 금지
  - 디자인 시스템에 새 컴포넌트 추가 금지
  - step wizard UI 구현 금지 (단일 페이지)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 복잡한 폼 UI, DatePicker/Select/Checkbox 조합, 조건부 필드
  - **Skills**: [`frontend-ui-ux`, `client-code-quality`]
    - `frontend-ui-ux`: 복잡한 폼 UI 구성
    - `client-code-quality`: 폼 검증 로직 품질
  - **Skills Evaluated but Omitted**:
    - `client-component-architecture`: 단일 페이지 폼이므로 복잡한 아키텍처 불필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 9)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 3, 6

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/app/login/_components/LoginForm.tsx` — 폼 컴포넌트 패턴 (RHF + 디자인 시스템 연동)
  - `packages/client/missionary-admin/src/app/login/_schemas/loginSchema.ts` — Zod 스키마 패턴
  - `packages/client/missionary-admin/src/app/login/_hooks/useLoginAction.ts` — mutation hook 패턴

  **API/Type References**:
  - POST /users — `{ email, password, name?, phoneNumber?, birthDate?, gender?, isBaptized?, baptizedAt? }`
  - `packages/server/missionary-server/src/user/dto/create-user.dto.ts` — 서버 DTO (검증 규칙 일치시킬 것)

  **External References**:
  - 디자인 시스템 컴포넌트: `InputField`, `Button`, `Checkbox`, `Select`, `DatePicker`, `Text`

  **Acceptance Criteria**:

  **TDD:**
  - [x] 테스트: SignupForm 렌더링 (모든 필수/선택 필드 존재)
  - [x] 테스트: 비밀번호 불일치 시 검증 에러
  - [x] 테스트: signupSchema — 유효 데이터 통과, 필수 필드 누락 거부, 비밀번호 불일치 거부
  - [x] 테스트: isBaptized=true일 때 baptizedAt 필드 표시
  - [x] vitest 실행 → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 회원가입 성공 후 로그인 페이지 이동
    Tool: Playwright (playwright skill)
    Preconditions: 서버 실행 중, dev 서버 실행 중, 테스트 이메일 미사용 상태
    Steps:
      1. Navigate to: http://localhost:3000/signup
      2. Wait for: input[name="email"] visible (timeout: 5s)
      3. Fill: input[name="email"] → "newsignup@test.com"
      4. Fill: input[name="password"] → "TestPass123!"
      5. Fill: input[name="passwordConfirm"] → "TestPass123!"
      6. Fill: input[name="name"] → "테스트 사용자"
      7. Click: submit 버튼
      8. Wait for: navigation to /login (timeout: 10s)
      9. Assert: URL is /login
      10. Screenshot: .sisyphus/evidence/task-8-signup-success.png
    Expected Result: 로그인 페이지로 리다이렉트
    Evidence: .sisyphus/evidence/task-8-signup-success.png

  Scenario: 중복 이메일 에러
    Tool: Playwright (playwright skill)
    Preconditions: 서버 실행 중, 이미 가입된 이메일 존재
    Steps:
      1. Navigate to: http://localhost:3000/signup
      2. Fill: input[name="email"] → "existing@test.com" (기존 유저 이메일)
      3. Fill: input[name="password"] → "TestPass123!"
      4. Fill: input[name="passwordConfirm"] → "TestPass123!"
      5. Click: submit 버튼
      6. Wait for: error message visible (timeout: 5s)
      7. Assert: "이미 존재하는 이메일입니다" 메시지 표시
      8. Screenshot: .sisyphus/evidence/task-8-signup-duplicate.png
    Expected Result: 중복 이메일 에러 표시
    Evidence: .sisyphus/evidence/task-8-signup-duplicate.png

  Scenario: 비밀번호 불일치 검증
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:3000/signup
      2. Fill: input[name="password"] → "TestPass123!"
      3. Fill: input[name="passwordConfirm"] → "DifferentPass"
      4. Click: submit 버튼
      5. Assert: 비밀번호 불일치 에러 메시지 표시
      6. Screenshot: .sisyphus/evidence/task-8-password-mismatch.png
    Expected Result: 비밀번호 확인 에러 표시
    Evidence: .sisyphus/evidence/task-8-password-mismatch.png
  ```

  **Commit**: YES
  - Message: `feat(app): 회원가입 페이지 구현 (전체 정보 수집 폼)`
  - Files: `packages/client/missionary-app/src/app/signup/`
  - Pre-commit: `pnpm --filter missionary-app exec vitest --run`

---

- [x] 9. 비밀번호 변경 페이지

  **What to do**:
  - TDD: 테스트 먼저 작성
  - `src/app/(main)/change-password/page.tsx` — 비밀번호 변경 페이지
  - `src/app/(main)/change-password/_components/ChangePasswordForm.tsx` — 폼
    - 현재 비밀번호 (InputField)
    - 새 비밀번호 (InputField)
    - 새 비밀번호 확인 (InputField)
    - 변경 버튼 (Button)
  - `src/app/(main)/change-password/_schemas/changePasswordSchema.ts` — Zod 스키마
    - currentPassword: 필수
    - newPassword: 최소 8자 필수
    - newPasswordConfirm: newPassword와 일치
  - `src/app/(main)/change-password/_hooks/useChangePasswordAction.ts` — mutation
    - authApi.changePassword() 호출
    - 성공: 성공 메시지 표시
    - 401 에러: "현재 비밀번호가 올바르지 않습니다" 폼 에러

  **Must NOT do**:
  - 비밀번호 찾기(이메일 발송) 기능 추가 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순한 3개 필드 폼, 로그인 폼과 동일한 패턴
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 폼 UI 구성

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8)
  - **Blocks**: Task 10
  - **Blocked By**: Task 5

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/app/login/_components/LoginForm.tsx` — 폼 컴포넌트 패턴
  - `packages/client/missionary-admin/src/app/login/_hooks/useLoginAction.ts` — mutation hook 패턴

  **API/Type References**:
  - PATCH /auth/change-password — `{ currentPassword: string, newPassword: string }`

  **Acceptance Criteria**:

  **TDD:**
  - [x] 테스트: ChangePasswordForm 렌더링 (3개 필드 + 버튼 존재)
  - [x] 테스트: 새 비밀번호 불일치 시 검증 에러
  - [x] 테스트: changePasswordSchema 검증 규칙
  - [x] vitest 실행 → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 비밀번호 변경 성공
    Tool: Playwright (playwright skill)
    Preconditions: 서버 실행 중, 로그인 상태 (access_token 쿠키 존재)
    Steps:
      1. Navigate to: http://localhost:3000/change-password
      2. Fill: input[name="currentPassword"] → "TestPass123!"
      3. Fill: input[name="newPassword"] → "NewPass456!"
      4. Fill: input[name="newPasswordConfirm"] → "NewPass456!"
      5. Click: submit 버튼
      6. Wait for: 성공 메시지 visible (timeout: 5s)
      7. Assert: 성공 메시지 표시
      8. Screenshot: .sisyphus/evidence/task-9-change-pw-success.png
    Expected Result: 비밀번호 변경 성공 메시지
    Evidence: .sisyphus/evidence/task-9-change-pw-success.png

  Scenario: 현재 비밀번호 틀림
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:3000/change-password
      2. Fill: input[name="currentPassword"] → "WrongPass"
      3. Fill: input[name="newPassword"] → "NewPass456!"
      4. Fill: input[name="newPasswordConfirm"] → "NewPass456!"
      5. Click: submit 버튼
      6. Assert: "현재 비밀번호가 올바르지 않습니다" 에러 표시
      7. Screenshot: .sisyphus/evidence/task-9-change-pw-wrong.png
    Expected Result: 에러 메시지 표시
    Evidence: .sisyphus/evidence/task-9-change-pw-wrong.png
  ```

  **Commit**: YES
  - Message: `feat(app): 비밀번호 변경 페이지 구현`
  - Files: `packages/client/missionary-app/src/app/(main)/change-password/`
  - Pre-commit: `pnpm --filter missionary-app exec vitest --run`

---

- [x] 10. 미들웨어 (라우트 보호)

  **What to do**:
  - TDD: 테스트 먼저 작성
  - `src/middleware.ts` — Next.js 미들웨어
    - 비인증 사용자 → /login 리다이렉트 (access_token 쿠키 없음)
    - 인증 사용자가 /login 또는 /signup 접근 → / 리다이렉트
    - 정적 파일, \_next, 이미지 등 제외 (matcher 설정)
    - /login, /signup은 공개 라우트로 설정
    - Admin의 proxy.ts 로직과 동일하되, /signup도 공개 라우트에 포함

  **Must NOT do**:
  - 토큰 검증(JWT 디코딩)을 미들웨어에서 하지 않음 (쿠키 존재 여부만 확인)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단일 파일, Admin proxy.ts를 약간 확장
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (sequential)
  - **Blocks**: Task 11
  - **Blocked By**: Tasks 7, 8, 9

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/proxy.ts` — 미들웨어 구현 패턴 (전체 파일 — access_token 쿠키 체크, 리다이렉트 로직, matcher 설정)

  **Acceptance Criteria**:

  **TDD:**
  - [x] 테스트: 쿠키 없이 / 요청 → /login 리다이렉트
  - [x] 테스트: 쿠키 있이 /login 요청 → / 리다이렉트
  - [x] 테스트: 쿠키 없이 /login 요청 → NextResponse.next()
  - [x] 테스트: 쿠키 없이 /signup 요청 → NextResponse.next()
  - [x] vitest 실행 → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 비인증 사용자 리다이렉트
    Tool: Playwright (playwright skill)
    Preconditions: dev 서버 실행 중, 쿠키 없음
    Steps:
      1. Clear all cookies
      2. Navigate to: http://localhost:3000/
      3. Wait for: navigation complete (timeout: 5s)
      4. Assert: URL is http://localhost:3000/login
      5. Screenshot: .sisyphus/evidence/task-10-unauthenticated-redirect.png
    Expected Result: /login으로 리다이렉트
    Evidence: .sisyphus/evidence/task-10-unauthenticated-redirect.png

  Scenario: 인증 사용자가 /login 접근
    Tool: Playwright (playwright skill)
    Preconditions: dev 서버 실행 중, 로그인 상태
    Steps:
      1. 먼저 /login 페이지에서 로그인 수행
      2. Navigate to: http://localhost:3000/login
      3. Wait for: navigation complete (timeout: 5s)
      4. Assert: URL is http://localhost:3000/ (홈으로 리다이렉트)
      5. Screenshot: .sisyphus/evidence/task-10-authenticated-login-redirect.png
    Expected Result: 홈으로 리다이렉트
    Evidence: .sisyphus/evidence/task-10-authenticated-login-redirect.png

  Scenario: 비인증 사용자 회원가입 접근 허용
    Tool: Playwright (playwright skill)
    Steps:
      1. Clear all cookies
      2. Navigate to: http://localhost:3000/signup
      3. Wait for: form visible (timeout: 5s)
      4. Assert: URL is http://localhost:3000/signup (리다이렉트 없음)
      5. Screenshot: .sisyphus/evidence/task-10-signup-accessible.png
    Expected Result: 회원가입 페이지 정상 표시
    Evidence: .sisyphus/evidence/task-10-signup-accessible.png
  ```

  **Commit**: YES
  - Message: `feat(app): 라우트 보호 미들웨어 구현`
  - Files: `packages/client/missionary-app/src/middleware.ts`
  - Pre-commit: `pnpm --filter missionary-app exec vitest --run`

---

- [x] 11. 레이아웃 통합 (Root Layout + (main) 라우트 그룹)

  **What to do**:
  - `src/app/layout.tsx` 수정 — QueryProvider 래핑
  - `src/app/(main)/layout.tsx` 생성 — 서버 레이아웃
    - `dynamic = 'force-dynamic'`
    - serverInstance로 auth/me 프리페치
    - dehydratedState를 MainLayoutClient에 전달
  - `src/app/(main)/MainLayoutClient.tsx` 생성 — 클라이언트 레이아웃
    - HydrationBoundary (프리페치 데이터 하이드레이션)
    - AsyncBoundary (AuthErrorFallback, AuthLoadingFallback)
    - AuthProvider
    - 기본 레이아웃 구조 (헤더/메인 영역)
  - `src/app/(main)/page.tsx` 생성 — 홈 페이지 (임시)
    - 최소한의 "홈" 텍스트 + 로그아웃 버튼
    - useAuth()로 유저 정보 표시
  - `src/app/login/layout.tsx` — 로그인 전용 레이아웃 (간단, QueryProvider 포함)
  - `src/app/signup/layout.tsx` — 회원가입 전용 레이아웃 (간단, QueryProvider 포함)

  **Must NOT do**:
  - 완전한 홈페이지 UI를 만들지 않음 (최소한의 인증 확인용)
  - 사이드바/네비게이션을 완전히 구현하지 않음 (인증 플로우 확인용 최소 UI)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 서버/클라이언트 레이아웃 분리, HydrationBoundary, AuthProvider 통합 — 복잡한 조합
  - **Skills**: [`client-component-architecture`]
    - `client-component-architecture`: 페이지/레이아웃 설계 패턴
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: 최소 UI만 만들므로 불필요

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (after Task 10)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 4, 5, 6, 10

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/app/layout.tsx` — Root layout 패턴 (QueryProvider 래핑)
  - `packages/client/missionary-admin/src/app/(admin)/layout.tsx` — 서버 레이아웃 패턴 (prefetch + dehydrate)
  - `packages/client/missionary-admin/src/app/(admin)/AdminLayoutClient.tsx` — 클라이언트 레이아웃 패턴 (HydrationBoundary + AsyncBoundary + AuthProvider)
  - `packages/client/missionary-admin/src/apis/serverInstance.ts` — 서버사이드 API 인스턴스 사용법

  **API/Type References**:
  - `src/apis/serverInstance.ts` (Task 3에서 생성) — 서버사이드 auth/me 호출
  - `src/lib/queryKeys.ts` (Task 4에서 생성) — auth.me() 키
  - `src/lib/auth/AuthContext.tsx` (Task 5에서 생성) — AuthProvider

  **Acceptance Criteria**:
  - [x] `pnpm build:app` → 빌드 성공
  - [x] (main) 라우트 그룹 페이지 접근 시 AuthProvider로 유저 데이터 로드
  - [x] 서버사이드 프리페치가 동작하여 클라이언트 측 워터폴 없음

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 전체 인증 플로우 E2E
    Tool: Playwright (playwright skill)
    Preconditions: 서버 + dev 서버 실행 중
    Steps:
      1. Clear all cookies
      2. Navigate to: http://localhost:3000/
      3. Assert: /login으로 리다이렉트 (미들웨어)
      4. Navigate to: http://localhost:3000/signup
      5. 회원가입 수행 (이메일: e2e-test@test.com, 비밀번호: E2eTest123!)
      6. Assert: /login으로 리다이렉트
      7. /login에서 방금 가입한 계정으로 로그인
      8. Assert: /로 리다이렉트
      9. Assert: 홈 페이지에 유저 정보 표시
      10. 로그아웃 버튼 클릭
      11. Assert: /login으로 리다이렉트
      12. Screenshot: .sisyphus/evidence/task-11-full-e2e.png
    Expected Result: 회원가입 → 로그인 → 홈 → 로그아웃 전체 플로우 동작
    Evidence: .sisyphus/evidence/task-11-full-e2e.png

  Scenario: 빌드 성공 확인
    Tool: Bash
    Steps:
      1. pnpm build:app
      2. Assert: 프로세스 종료 코드 0
      3. Assert: .next 디렉토리 생성
    Expected Result: 빌드 성공
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `feat(app): 레이아웃 통합 및 인증 플로우 완성`
  - Files: `packages/client/missionary-app/src/app/layout.tsx`, `src/app/(main)/`, `src/app/login/layout.tsx`, `src/app/signup/layout.tsx`
  - Pre-commit: `pnpm build:app`

---

## Commit Strategy

| After Task | Message                                                                              | Files                           | Verification        |
| ---------- | ------------------------------------------------------------------------------------ | ------------------------------- | ------------------- |
| 1          | `feat(server): 회원가입 공개 API, OAuth state 라우팅, 비밀번호 변경 엔드포인트 추가` | server auth + user              | `pnpm build:server` |
| 2          | `chore(app): 인증 기능 의존성 및 테스트 환경 설정`                                   | package.json, vitest.config.ts  | `pnpm build:app`    |
| 3          | `feat(app): API 클라이언트 및 인증/유저 API 모듈 구현`                               | src/apis/                       | vitest              |
| 4          | `feat(app): QueryProvider 및 queryKeys 설정`                                         | src/lib/                        | vitest              |
| 5          | `feat(app): Auth Context 및 인증 hooks 구현`                                         | src/lib/auth/, src/hooks/auth/  | vitest              |
| 6          | `feat(app): Boundary 컴포넌트 구현`                                                  | src/components/boundary/        | vitest              |
| 7          | `feat(app): 로그인 페이지 구현`                                                      | src/app/login/                  | vitest              |
| 8          | `feat(app): 회원가입 페이지 구현`                                                    | src/app/signup/                 | vitest              |
| 9          | `feat(app): 비밀번호 변경 페이지 구현`                                               | src/app/(main)/change-password/ | vitest              |
| 10         | `feat(app): 라우트 보호 미들웨어 구현`                                               | src/middleware.ts               | vitest              |
| 11         | `feat(app): 레이아웃 통합 및 인증 플로우 완성`                                       | src/app/ layouts                | `pnpm build:app`    |

---

## Success Criteria

### Verification Commands

```bash
pnpm build:server                          # Expected: 빌드 성공
pnpm build:app                             # Expected: 빌드 성공
pnpm --filter missionary-app exec vitest --run  # Expected: 모든 테스트 통과
```

### Final Checklist

- [x] 이메일/비밀번호 로그인 동작
- [x] 회원가입 (전체 정보) 동작
- [x] Google OAuth 로그인 플로우 동작
- [x] Kakao OAuth 로그인 플로우 동작
- [x] 비밀번호 변경 동작
- [x] 미들웨어 라우트 보호 동작
- [x] 401 인터셉터 + 토큰 자동 갱신 동작
- [x] 로그아웃 동작
- [x] SSR 프리페치 동작 (워터폴 없음)
- [x] 모든 TDD 테스트 통과
- [x] `pnpm build:app` 성공
- [x] `pnpm build:server` 성공
- [x] Admin 앱 기존 기능 영향 없음
