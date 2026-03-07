# 유저 관리 페이지 구현

## TL;DR

> **Quick Summary**: missionary-admin에 유저 관리 기능을 추가한다. 백엔드(페이지네이션, 소프트 삭제, 권한 확장)를 먼저 수정하고, 프론트엔드(목록 테이블 + 우측 편집 패널)를 구축한다.
>
> **Deliverables**:
> - 백엔드: 페이지네이션 API, 소프트 삭제, STAFF 조회 권한, 역할 변경 API, MaskingInterceptor 조건부 처리
> - 프론트엔드: 유저 목록 페이지 (가로 스크롤 테이블) + 우측 슬라이드 편집 패널 + 삭제 모달
> - 테스트: 백엔드 Jest + 프론트엔드 Vitest/MSW
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Backend API 수정 (TDD) → Frontend API Layer → UI 컴포넌트 → 프론트엔드 테스트

---

## Context

### Original Request
missionary-admin 앱에 유저 관리 페이지를 추가. 기존 missions 패턴을 참고하되, 테이블 목록 + 우측 편집 패널 구조로 구현.

### Interview Summary
**Key Discussions**:
- UI: HTML 목업으로 3차 이터레이션 후 확정 — 가로 스크롤 테이블 + 560px 우측 편집 패널 (블러 없음)
- 패널은 바로 수정 가능 (별도 수정 페이지 없음), dirty check로 저장/되돌리기 제공
- 권한: USER → 어드민 접근 불가, STAFF → 조회만, ADMIN → 전체 CRUD
- 삭제: 소프트 삭제 (deletedAt 기록, 30일 보존 후 영구 삭제)
- 페이지네이션: 백엔드 + 프론트엔드 모두
- 테스트: 포함 (백엔드 Jest, 프론트엔드 Vitest + MSW)
- 역할 변경: ADMIN이 드롭다운으로 변경 가능 (목업에서 확인됨)
- 읽기 전용 필드: 이메일, 인증방식, 로그인ID
- 주민등록번호: 마스킹 기본, 보기/숨기기 토글

**Research Findings**:
- 사이드바 `/users` 라우트 이미 등록됨, 헤더 페이지 타이틀도 등록됨
- 기존 패턴: 서버 컴포넌트 SSR fetch, 서버 액션 mutation, TanStack Query 캐싱
- `@samilhero/design-system` 컴포넌트: Button, Input, Select, Pagination, SearchBox, Badge, Switch, Radio 등 사용 가능
- RolesGuard는 명시적 나열 방식 (계층적이 아님)
- `MaskingInterceptor`가 전역으로 `phoneNumber`, `identityNumber` 마스킹 중 → 주민번호 show/hide 토글과 충돌

### Pre-Planner Review
**Identified Gaps** (addressed):
- MaskingInterceptor 충돌: ADMIN 역할 시 조건부 마스킹 해제로 해결
- 소프트 삭제 + 인증 플로우 충돌: `findByEmail`, `findByProvider` 등에 `deletedAt: null` 조건 추가
- 자기 자신 삭제 방지: 백엔드에서 현재 유저 ID와 대상 ID 비교하여 차단
- 마지막 ADMIN 삭제 방지: ADMIN 수 검증 로직 추가
- `UpdateUserDto`에 `role` 필드 부재: DTO에 role 필드 추가 (ADMIN만 사용 가능)
- `AuthUser.id` 타입 불일치 (number vs UUID string): 프론트엔드 타입 수정
- 페이지네이션 응답 형식: 오프셋 기반 `{ data, total, page, pageSize }`

---

## Work Objectives

### Core Objective
missionary-admin에 유저 관리 기능(목록 조회, 상세 확인, 수정, 삭제)을 추가하고, 역할 기반 접근 제어를 적용한다.

### Concrete Deliverables
- `GET /users` API에 페이지네이션, 검색, 필터, 소프트 삭제 필터링 추가
- `DELETE /users/:id` 소프트 삭제로 변경 + 자기 삭제/마지막 ADMIN 삭제 방지
- `PATCH /users/:id` role 변경 가능하도록 DTO 확장
- STAFF 역할에 유저 목록 조회 권한 추가
- MaskingInterceptor에 ADMIN 역할 조건부 마스킹 해제
- `(admin)/users/page.tsx` 유저 목록 페이지
- `UserTable`, `UserSearchFilter`, `UserDetailPanel`, `DeleteUserModal` 컴포넌트
- 프론트엔드 API 모듈, 쿼리 키, Zod 스키마
- 백엔드 + 프론트엔드 테스트

### Definition of Done
- [ ] `pnpm --filter missionary-server test` 전체 통과
- [ ] `pnpm --filter missionary-admin test` 전체 통과
- [ ] `pnpm type-check` 전체 통과
- [ ] `pnpm lint:all` 전체 통과

### Must Have
- 가로 스크롤 유저 목록 테이블 (이름 sticky)
- 행 클릭 시 우측 560px 편집 패널 슬라이드 오픈
- 패널에서 바로 수정 가능 (dirty check + 저장/되돌리기)
- 읽기 전용 필드: 이메일, 인증방식, 로그인ID
- 주민등록번호 마스킹 + 보기/숨기기 토글 (ADMIN만)
- 역할 기반 UI 분기 (STAFF: 읽기 전용 / ADMIN: 편집 + 삭제)
- 소프트 삭제 + 삭제 확인 모달
- 자기 자신 삭제 방지, 마지막 ADMIN 삭제 방지
- 오프셋 기반 페이지네이션
- 이름/이메일 검색 + 역할/인증방식/세례여부 필터

### Must NOT Have (Guardrails)
- 유저 생성(회원가입) 기능 추가 금지
- 비밀번호 관리/리셋 기능 금지
- 삭제된 유저 복구 기능 금지
- CSV/Excel 내보내기 기능 금지
- 복합 검색/날짜 범위 필터 금지 (기본 필터만)
- `BaseRepository` 인터페이스 변경 금지
- 기존 인증 플로우(OAuth, 로그인) 동작 변경 금지
- 디자인 시스템에 없는 커스텀 UI 컴포넌트 과도 생성 금지

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (Backend: Jest, Frontend: Vitest + MSW + Testing Library)
- **Automated tests**: YES (Hybrid — Backend TDD + Frontend Tests-after)
- **Framework**: Backend `jest`, Frontend `vitest`
- **Backend TDD**: 각 백엔드 태스크에서 RED → GREEN → REFACTOR 사이클 적용. 테스트 코드가 구현과 같은 태스크에 포함됨.
- **Frontend Tests-after**: UI 컴포넌트 구현 완료 후 별도 Wave에서 테스트 작성.

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.orchestrator/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Backend API**: Use Bash (curl) — Send requests, assert status + response fields
- **Frontend UI**: Use Vitest + Testing Library — Render, interact, assert DOM
- **Integration**: Use `pnpm --filter` test commands — Run full test suites

---

## Execution Strategy

### Parallel Execution Waves

> Wave 1: 백엔드 수정 — TDD (6 tasks parallel, 각 태스크에 테스트 포함)
> Wave 2: 프론트엔드 API Layer (3 tasks parallel)
> Wave 3: 프론트엔드 UI 컴포넌트 (3 tasks parallel)
> Wave 4: 프론트엔드 테스트 (1 task) + Final Verification (4 tasks parallel)

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1. Backend pagination (TDD) | - | 7, 10 | 1 |
| 2. Backend soft delete (TDD) | - | 7, 11 | 1 |
| 3. Backend STAFF access + role update (TDD) | - | 7, 10 | 1 |
| 4. Backend MaskingInterceptor conditional (TDD) | - | 7, 11 | 1 |
| 5. Backend delete guards (TDD) | 2 | 12 | 1 |
| 6. Frontend auth type fix | - | 7, 10, 11 | 1 |
| 7. Frontend API module + query keys | 1,2,3,4 | 10, 11, 12 | 2 |
| 8. Frontend Zod schema | - | 11 | 2 |
| 9. Frontend MSW handlers + mock data | 1,2,3 | 13 | 2 |
| 10. User list page + table + filters | 7 | 13 | 3 |
| 11. User detail/edit panel | 7, 8 | 13 | 3 |
| 12. Delete user modal | 7 | 13 | 3 |
| 13. Frontend tests | 9,10,11,12 | F1-F4 | 4 |

---

## TODOs

- [ ] 1. Backend: `GET /users` 페이지네이션 + 검색 + 필터 (TDD)

  **What to do**:
  **RED — 테스트 먼저 작성:**
  - `src/user/user-pagination.service.spec.ts` 생성 (colocated 패턴, 기존 `user.service.spec.ts`와 동일 디렉토리)
  - 테스트 케이스:
    - `findAll()` 기본 호출 → `{ data, total, page, pageSize }` 형식 반환
    - `page=2, pageSize=5` → skip=5, take=5로 호출되는지 확인
    - `search='홍길동'` → name OR email에 contains 조건 포함
    - `role='ADMIN'` → where 조건에 role 포함
    - `deletedAt: null` 조건이 항상 포함되는지 확인
  - Repository를 mock하여 서비스 로직만 단위 테스트
  - 테스트 실행 → 전부 FAIL 확인 (RED)

  **GREEN — 구현:**
  - `UserController.findAll()`에 쿼리 파라미터 추가: `page`, `pageSize`, `search` (이름/이메일), `role`, `provider`, `isBaptized`
  - `UserService.findAll()`에 Prisma `where` 조건 빌드 + `skip`/`take` 오프셋 페이지네이션 적용
  - `deletedAt: null` 조건을 기본으로 추가하여 삭제된 유저 제외
  - 응답 형식: `{ data: User[], total: number, page: number, pageSize: number }`
  - `FindAllUsersQueryDto` 생성 (class-validator 데코레이터 포함)
  - `UserRepository`에 `findManyWithPagination()` 메서드 추가 (또는 기존 메서드 확장)
  - Swagger `@ApiQuery` 데코레이터 추가
  - 테스트 실행 → 전부 PASS 확인 (GREEN)

  **REFACTOR — 정리:**
  - 중복 코드 제거, 네이밍 개선, 쿼리 빌더 로직 분리 (필요 시)

  **Must NOT do**:
  - `BaseRepository` 인터페이스 변경 금지
  - 복합 검색 (AND/OR 조합), 날짜 범위 필터 금지
  - 기존 `POST /users` (회원가입) 동작 변경 금지

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: 백엔드 비즈니스 로직, Prisma 쿼리 빌더, DTO 유효성 검증 등 복합적 로직
  - **Skills**: [`prisma`, `nestjs`, `jest`]
    - `prisma`: Prisma where 조건 빌드, skip/take 페이지네이션
    - `nestjs`: DTO 데코레이터, 컨트롤러 쿼리 파라미터
    - `jest`: RED-GREEN-REFACTOR 테스트 사이클

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5, 6)
  - **Blocks**: [Task 7, Task 10]
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/server/missionary-server/src/user/user.controller.ts` — 기존 `findAll()` 엔드포인트, `@Roles` 데코레이터 패턴
  - `packages/server/missionary-server/src/user/user.service.ts` — 기존 `findAll()` 구현
  - `packages/server/missionary-server/src/user/repositories/prisma-user.repository.ts` — Prisma repository 패턴
  - `packages/server/missionary-server/src/mission-group/mission-group.controller.ts` — 페이지네이션 쿼리 파라미터 참조 (유사 패턴이 있다면)

  **Test References**:
  - `packages/server/missionary-server/src/user/user.service.spec.ts` — 기존 유저 서비스 테스트 패턴 (NestJS Testing 모듈, Repository mock 방식)
  - `packages/server/missionary-server/src/auth/auth.service.spec.ts` — 서비스 테스트 패턴 참조

  **API/Type References**:
  - `packages/server/missionary-server/src/user/dto/create-user.dto.ts` — DTO 데코레이터 패턴 참조
  - `packages/server/missionary-server/prisma/schema.prisma` — User 모델 필드 정의

  **Acceptance Criteria**:

  - [ ] 테스트 파일 생성: `src/user/user-pagination.service.spec.ts`
  - [ ] `pnpm --filter missionary-server test -- user-pagination` → ALL PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 기본 페이지네이션 조회
    Tool: Bash (curl)
    Preconditions: DB에 유저 20명 이상 존재 (seed 또는 테스트 데이터)
    Steps:
      1. curl -X GET "http://localhost:4000/users?page=1&pageSize=10" -H "Cookie: ..."
      2. 응답 status 200, body에 data 배열(10개), total, page=1, pageSize=10 확인
    Expected Result: 200 OK, data.length === 10, total >= 20
    Evidence: .orchestrator/evidence/task-1-pagination-basic.json

  Scenario: 이름 검색 필터
    Tool: Bash (curl)
    Steps:
      1. curl -X GET "http://localhost:4000/users?search=홍길동" -H "Cookie: ..."
      2. 응답 data 배열의 모든 항목에 name 또는 email에 '홍길동' 포함 확인
    Expected Result: 200 OK, 검색 결과만 반환
    Evidence: .orchestrator/evidence/task-1-search-filter.json

  Scenario: 삭제된 유저 제외 확인
    Tool: Bash (curl)
    Steps:
      1. DB에 deletedAt이 설정된 유저 존재 상태에서 GET /users 호출
      2. 응답 data에 deletedAt이 null이 아닌 유저가 없는지 확인
    Expected Result: 삭제된 유저가 목록에 나타나지 않음
    Evidence: .orchestrator/evidence/task-1-soft-delete-filter.json
  ```

  **Commit**: YES (Wave 1 그룹 커밋)
  - Message: `feat(server): 유저 API 페이지네이션, 소프트 삭제, 권한 확장`
  - Files: `packages/server/missionary-server/src/user/**` (구현 + `user-pagination.service.spec.ts`)

- [ ] 2. Backend: `DELETE /users/:id` 소프트 삭제 전환 (TDD)

  **What to do**:
  **RED — 테스트 먼저 작성:**
  - `src/user/user-soft-delete.service.spec.ts` 생성 (colocated 패턴)
  - 테스트 케이스:
    - `remove(id)` 호출 → `prisma.user.update({ deletedAt })` 호출 확인 (delete가 아님)
    - 소프트 삭제 후 `findByEmail()` → null 반환 (deletedAt 필터링)
    - 소프트 삭제 후 `findByProvider()` → null 반환
    - 소프트 삭제 후 `findByLoginIdAndRole()` → null 반환
  - 테스트 실행 → 전부 FAIL 확인 (RED)

  **GREEN — 구현:**
  - `UserService.remove()` 메서드를 하드 삭제(`prisma.user.delete`)에서 소프트 삭제(`prisma.user.update({ deletedAt: new Date() })`)로 변경
  - `UserRepository`에 `softDelete(id: string)` 메서드 추가
  - 인증 관련 쿼리에 `deletedAt: null` 조건 추가:
    - `AuthService`의 `findByEmail()`, `validateUser()` 등
    - `UserRepository`의 `findByEmail()`, `findByProvider()`, `findByLoginId()` 등
  - 소프트 삭제된 유저가 로그인 시도 시 적절한 에러 메시지 반환 확인
  - 테스트 실행 → 전부 PASS 확인 (GREEN)

  **REFACTOR — 정리:**
  - softDelete 로직 Repository로 캡슐화, 중복 where 조건 상수화 (필요 시)

  **Must NOT do**:
  - 기존 인증 플로우(OAuth, 로그인) 동작 변경 금지 (조건 추가만)
  - 삭제된 유저 복구 기능 금지
  - `BaseRepository` 인터페이스 변경 금지

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: 인증 플로우와의 충돌 방지, 다중 파일 수정의 정합성 보장
  - **Skills**: [`prisma`, `nestjs`, `jest`]
    - `prisma`: soft delete 패턴, where 조건 추가
    - `nestjs`: 서비스 계층 로직
    - `jest`: RED-GREEN-REFACTOR 테스트 사이클

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5, 6)
  - **Blocks**: [Task 5, Task 7, Task 11]
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/server/missionary-server/src/user/user.service.ts` — 기존 `remove()` 메서드
  - `packages/server/missionary-server/src/user/repositories/prisma-user.repository.ts` — Prisma 쿼리 패턴
  - `packages/server/missionary-server/src/auth/auth.service.ts` — `findByEmail`, `validateUser` 등 인증 쿼리

  **API/Type References**:
  - `packages/server/missionary-server/prisma/schema.prisma` — User 모델의 `deletedAt DateTime?` 필드

  **Acceptance Criteria**:

  - [ ] 테스트 파일 생성: `src/user/user-soft-delete.service.spec.ts`
  - [ ] `pnpm --filter missionary-server test -- user-soft-delete` → ALL PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 소프트 삭제 동작 확인
    Tool: Bash (curl)
    Preconditions: 테스트 유저 존재
    Steps:
      1. DELETE /users/:id 호출 (ADMIN 인증)
      2. DB에서 해당 유저의 deletedAt 필드가 null이 아닌지 확인
      3. 해당 유저가 GET /users 목록에서 제외되는지 확인
    Expected Result: 유저 레코드 유지, deletedAt 설정됨, 목록에서 제외
    Evidence: .orchestrator/evidence/task-2-soft-delete.json

  Scenario: 소프트 삭제된 유저 로그인 차단
    Tool: Bash (curl)
    Steps:
      1. 소프트 삭제된 유저의 이메일/비밀번호로 POST /auth/login 호출
      2. 로그인 실패 확인 (401 또는 적절한 에러)
    Expected Result: 로그인 불가, 적절한 에러 메시지
    Evidence: .orchestrator/evidence/task-2-login-blocked.json
  ```

  **Commit**: YES (Wave 1 그룹 커밋)
  - Message: `feat(server): 유저 API 페이지네이션, 소프트 삭제, 권한 확장`
  - Files: `packages/server/missionary-server/src/user/**` (구현 + `user-soft-delete.service.spec.ts`), `packages/server/missionary-server/src/auth/**`

- [ ] 3. Backend: STAFF 조회 권한 + `PATCH /users/:id` 역할 변경 (TDD)

  **What to do**:
  **RED — 테스트 먼저 작성:**
  - `src/user/user-roles.service.spec.ts` 생성 (colocated 패턴)
  - 테스트 케이스:
    - ADMIN이 `update(id, { role: 'STAFF' }, adminUser)` → 성공, role 변경됨
    - STAFF가 `update(id, { role: 'ADMIN' }, staffUser)` → ForbiddenException throw
    - STAFF가 `update(id, { name: '변경' }, staffUser)` → role 외 필드는 어떻게 처리? (STAFF는 수정 권한 없으므로 Controller 레벨에서 차단 — 서비스에서는 role 변경만 검증)
  - 테스트 실행 → 전부 FAIL 확인 (RED)

  **GREEN — 구현:**
  - `UserController.findAll()`의 `@Roles(UserRole.ADMIN)`을 `@Roles(UserRole.ADMIN, UserRole.STAFF)`로 변경
  - `UserController.findOne()`에도 STAFF 접근 허용 (이미 Authenticated이면 OK인지 확인)
  - `UpdateUserDto`에 `role` 필드 추가 (`@IsEnum(UserRole)`, `@IsOptional()`)
  - `UserService.update()`에서 role 변경 시 **요청자가 ADMIN인지 검증** (STAFF가 role 변경 시도 차단)
  - `@CurrentUser()` 데코레이터로 요청자 정보 가져와서 권한 검증
  - 테스트 실행 → 전부 PASS 확인 (GREEN)

  **REFACTOR — 정리:**
  - 권한 검증 로직 분리 (필요 시)

  **Must NOT do**:
  - USER 역할에 어드민 접근 허용 금지
  - STAFF에 수정/삭제 권한 부여 금지 (조회만)
  - 기존 `@Roles` 가드 로직 변경 금지 (데코레이터 값만 변경)

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: 권한 체계 로직, DTO 확장, 요청자 검증 등 보안 관련 로직
  - **Skills**: [`nestjs`, `jest`]
    - `nestjs`: Guards, Decorators, DTO 패턴
    - `jest`: RED-GREEN-REFACTOR 테스트 사이클

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5, 6)
  - **Blocks**: [Task 7, Task 10]
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/server/missionary-server/src/user/user.controller.ts` — `@Roles(UserRole.ADMIN)` 데코레이터 패턴
  - `packages/server/missionary-server/src/common/decorators/roles.decorator.ts` — Roles 데코레이터 정의
  - `packages/server/missionary-server/src/common/guards/roles.guard.ts` — RolesGuard 동작 방식 (명시적 나열)
  - `packages/server/missionary-server/src/common/decorators/current-user.decorator.ts` — 현재 유저 정보 추출

  **API/Type References**:
  - `packages/server/missionary-server/src/user/dto/update-user.dto.ts` — 기존 UpdateUserDto (role 필드 부재)
  - `packages/server/missionary-server/src/common/enums/user-role.enum.ts` — UserRole enum (USER, STAFF, ADMIN)

  **Acceptance Criteria**:

  - [ ] 테스트 파일 생성: `src/user/user-roles.service.spec.ts`
  - [ ] `pnpm --filter missionary-server test -- user-roles` → ALL PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: STAFF 유저 목록 조회
    Tool: Bash (curl)
    Preconditions: STAFF 역할 유저 인증 토큰 확보
    Steps:
      1. GET /users (STAFF 인증) → 200 OK 확인
      2. GET /users (인증 없음) → 401 확인
    Expected Result: STAFF 조회 허용, 미인증 차단
    Evidence: .orchestrator/evidence/task-3-staff-access.json

  Scenario: ADMIN 역할 변경
    Tool: Bash (curl)
    Steps:
      1. PATCH /users/:id { "role": "STAFF" } (ADMIN 인증) → 200 OK
      2. 변경된 유저의 role이 STAFF인지 확인
    Expected Result: 역할 변경 성공
    Evidence: .orchestrator/evidence/task-3-role-change.json

  Scenario: STAFF 역할 변경 시도 차단
    Tool: Bash (curl)
    Steps:
      1. PATCH /users/:id { "role": "ADMIN" } (STAFF 인증)
      2. 403 Forbidden 또는 role 필드 무시 확인
    Expected Result: STAFF는 역할 변경 불가
    Evidence: .orchestrator/evidence/task-3-staff-role-denied.json
  ```

  **Commit**: YES (Wave 1 그룹 커밋)
  - Message: `feat(server): 유저 API 페이지네이션, 소프트 삭제, 권한 확장`
  - Files: `packages/server/missionary-server/src/user/**` (구현 + `user-roles.service.spec.ts`)

- [ ] 4. Backend: MaskingInterceptor ADMIN 조건부 마스킹 해제 (TDD)

  **What to do**:
  **RED — 테스트 먼저 작성:**
  - 기존 `src/common/interceptors/masking.interceptor.spec.ts` 확장 (colocated 패턴 유지)
  - 테스트 케이스:
    - ADMIN + 단건 조회 → identityNumber 마스킹 해제
    - ADMIN + 목록 조회 → identityNumber 마스킹 유지
    - STAFF + 단건 조회 → identityNumber 마스킹 유지
    - 모든 역할 + 모든 엔드포인트 → phoneNumber 항상 마스킹
  - ExecutionContext를 mock하여 역할/라우트 주입
  - 테스트 실행 → 전부 FAIL 확인 (RED)

  **GREEN — 구현:**
  - `MaskingInterceptor`에서 요청자의 역할이 ADMIN일 때 `identityNumber` 마스킹을 건너뛰도록 조건 추가
  - `phoneNumber`는 모든 역할에 대해 계속 마스킹 (변경 없음)
  - 인터셉터에서 `ExecutionContext`를 통해 요청자 역할 정보 접근
  - 프론트엔드에서 주민번호 show/hide 토글 시 마스킹 해제된 원본 데이터를 받을 수 있도록 함
  - 단건 조회(`GET /users/:id`) 응답에서만 조건부 해제 적용 (목록 조회는 항상 마스킹)
  - 테스트 실행 → 전부 PASS 확인 (GREEN)

  **REFACTOR — 정리:**
  - 마스킹 조건 로직이 복잡해졌다면 별도 헬퍼로 분리 (필요 시)

  **Must NOT do**:
  - `phoneNumber` 마스킹 로직 변경 금지
  - 인터셉터의 기본 동작(마스킹) 제거 금지 — 조건부 우회만
  - STAFF 역할에 마스킹 해제 허용 금지

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: 인터셉터 내부 로직 수정, ExecutionContext 활용, 보안 관련
  - **Skills**: [`nestjs`, `jest`]
    - `nestjs`: Interceptor 패턴, ExecutionContext
    - `jest`: RED-GREEN-REFACTOR 테스트 사이클

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5, 6)
  - **Blocks**: [Task 7, Task 11]
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/server/missionary-server/src/common/interceptors/masking.interceptor.ts` — 현재 MaskingInterceptor 구현
  - `packages/server/missionary-server/src/common/guards/roles.guard.ts` — ExecutionContext에서 역할 추출 패턴 참조

  **API/Type References**:
  - `packages/server/missionary-server/src/common/enums/user-role.enum.ts` — UserRole enum

  **Acceptance Criteria**:

  - [ ] 기존 테스트 파일 확장: `src/common/interceptors/masking.interceptor.spec.ts`
  - [ ] `pnpm --filter missionary-server test -- masking.interceptor` → ALL PASS (기존 + 신규 테스트)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: ADMIN 단건 조회 시 주민번호 원본 반환
    Tool: Bash (curl)
    Steps:
      1. GET /users/:id (ADMIN 인증)
      2. 응답의 identityNumber 필드가 마스킹 없는 원본인지 확인
    Expected Result: identityNumber가 마스킹 없이 반환됨
    Evidence: .orchestrator/evidence/task-4-admin-unmasked.json

  Scenario: STAFF 조회 시 주민번호 마스킹 유지
    Tool: Bash (curl)
    Steps:
      1. GET /users/:id (STAFF 인증)
      2. 응답의 identityNumber가 마스킹 처리되어 있는지 확인 (예: "990101-1******")
    Expected Result: identityNumber가 마스킹되어 반환됨
    Evidence: .orchestrator/evidence/task-4-staff-masked.json

  Scenario: 목록 조회 시 항상 마스킹
    Tool: Bash (curl)
    Steps:
      1. GET /users?page=1 (ADMIN 인증)
      2. 응답 data 배열의 모든 유저의 identityNumber가 마스킹되어 있는지 확인
    Expected Result: 목록에서는 ADMIN이어도 마스킹 유지
    Evidence: .orchestrator/evidence/task-4-list-always-masked.json
  ```

  **Commit**: YES (Wave 1 그룹 커밋)
  - Message: `feat(server): 유저 API 페이지네이션, 소프트 삭제, 권한 확장`
  - Files: `packages/server/missionary-server/src/common/interceptors/masking.interceptor.ts`, `packages/server/missionary-server/src/common/interceptors/masking.interceptor.spec.ts`

- [ ] 5. Backend: 삭제 가드 — 자기 삭제 방지 + 마지막 ADMIN 보호 (TDD)

  **What to do**:
  **RED — 테스트 먼저 작성:**
  - `src/user/user-delete-guards.service.spec.ts` 생성 (colocated 패턴)
  - 테스트 케이스:
    - `remove(id, currentUser)` where `currentUser.id === id` → `BadRequestException` throw
    - 대상이 ADMIN + 활성 ADMIN 1명 → `BadRequestException` throw
    - 대상이 ADMIN + 활성 ADMIN 2명 이상 → 삭제 성공
    - 대상이 STAFF → 정상 삭제 (ADMIN 수 무관)
  - Repository의 `countActiveAdmins()`를 mock
  - 테스트 실행 → 전부 FAIL 확인 (RED)

  **GREEN — 구현:**
  - `UserService.remove()`에 가드 로직 추가:
    1. **자기 삭제 방지**: `currentUser.id === targetId` 이면 `BadRequestException` throw
    2. **마지막 ADMIN 보호**: 대상 유저가 ADMIN이면, 현재 활성 ADMIN 수 조회 → 1명이면 `BadRequestException` throw
  - `UserRepository`에 `countActiveAdmins()` 메서드 추가 (`deletedAt: null AND role: ADMIN` 카운트)
  - `UserController.remove()`에 `@CurrentUser()` 파라미터 추가하여 요청자 ID 전달
  - 테스트 실행 → 전부 PASS 확인 (GREEN)

  **REFACTOR — 정리:**
  - 가드 로직을 별도 메서드로 추출 (필요 시)

  **Must NOT do**:
  - 삭제 권한 자체를 변경하지 않음 (ADMIN 전용 유지)
  - 삭제된 유저 복구 기능 추가 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 명확한 비즈니스 규칙 2개를 서비스 메서드에 추가하는 단순 작업
  - **Skills**: [`nestjs`, `prisma`, `jest`]
    - `nestjs`: Exception handling, CurrentUser 데코레이터
    - `prisma`: count 쿼리
    - `jest`: RED-GREEN-REFACTOR 테스트 사이클

  **Parallelization**:
  - **Can Run In Parallel**: YES (Task 2의 소프트 삭제와 같은 파일을 수정하지만, 다른 메서드이므로 병렬 가능. 단, 충돌 시 Wave 1 내 순차 처리)
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4, 6)
  - **Blocks**: [Task 12]
  - **Blocked By**: Task 2 (소프트 삭제 로직이 먼저 적용되어야 countActiveAdmins에서 deletedAt 조건 사용 가능)

  **References**:

  **Pattern References**:
  - `packages/server/missionary-server/src/user/user.service.ts` — `remove()` 메서드
  - `packages/server/missionary-server/src/user/user.controller.ts` — `@CurrentUser()` 사용 패턴
  - `packages/server/missionary-server/src/common/decorators/current-user.decorator.ts` — CurrentUser 데코레이터

  **API/Type References**:
  - `packages/server/missionary-server/src/user/repositories/prisma-user.repository.ts` — Prisma count 쿼리 패턴

  **Acceptance Criteria**:

  - [ ] 테스트 파일 생성: `src/user/user-delete-guards.service.spec.ts`
  - [ ] `pnpm --filter missionary-server test -- user-delete-guards` → ALL PASS

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 자기 자신 삭제 시도 차단
    Tool: Bash (curl)
    Steps:
      1. DELETE /users/{자기 자신 ID} (ADMIN 인증)
      2. 400 Bad Request 확인 + 에러 메시지 확인
    Expected Result: 삭제 차단, "자기 자신을 삭제할 수 없습니다" 유사 메시지
    Evidence: .orchestrator/evidence/task-5-self-delete-blocked.json

  Scenario: 마지막 ADMIN 삭제 시도 차단
    Tool: Bash (curl)
    Preconditions: 활성 ADMIN이 1명만 존재
    Steps:
      1. DELETE /users/{유일한 ADMIN ID} (다른 ADMIN 인증 — 없으면 테스트 환경 조정)
      2. 400 Bad Request 확인
    Expected Result: 삭제 차단, "마지막 관리자는 삭제할 수 없습니다" 유사 메시지
    Evidence: .orchestrator/evidence/task-5-last-admin-blocked.json
  ```

  **Commit**: YES (Wave 1 그룹 커밋)
  - Message: `feat(server): 유저 API 페이지네이션, 소프트 삭제, 권한 확장`
  - Files: `packages/server/missionary-server/src/user/**` (구현 + `user-delete-guards.service.spec.ts`)

- [ ] 6. Frontend: `AuthUser.id` 타입 수정

  **What to do**:
  - `AuthUser` 타입 정의에서 `id: number`를 `id: string`으로 변경 (Prisma User 모델은 UUID string)
  - 관련된 모든 사용처에서 타입 에러가 발생하지 않는지 확인
  - `useAuth()` 훅 반환값에 영향이 있는지 확인 및 수정

  **Must NOT do**:
  - 기존 인증 플로우 동작 변경 금지
  - 백엔드 응답 형식 변경 금지 (프론트엔드 타입만 수정)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 타입 정의 1곳 수정 + 사용처 확인의 단순 작업
  - **Skills**: [`typescript`]
    - `typescript`: 타입 수정, 사용처 추적

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4, 5)
  - **Blocks**: [Task 7, Task 10, Task 11]
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/apis/auth.ts:3-8` — AuthUser 인터페이스 정의 (`id: number` → `id: string`으로 수정 대상)
  - `packages/client/missionary-admin/src/lib/auth/AuthContext.tsx` — useAuth 훅 (AuthUser 타입 사용처)

  **API/Type References**:
  - `packages/server/missionary-server/prisma/schema.prisma` — User.id는 UUID string

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 타입 체크 통과
    Tool: Bash
    Steps:
      1. pnpm type-check 실행
      2. AuthUser.id 관련 에러 0개 확인
    Expected Result: 타입 체크 전체 통과 (0 errors)
    Evidence: .orchestrator/evidence/task-6-type-check.txt
  ```

  **Commit**: YES (Wave 1 그룹 커밋 — 프론트엔드 타입 수정은 백엔드 커밋에 포함)
  - Message: `feat(server): 유저 API 페이지네이션, 소프트 삭제, 권한 확장`
  - Files: `packages/client/missionary-admin/src/apis/auth.ts` (AuthUser 타입 정의 위치)

- [ ] 7. Frontend: 유저 API 모듈 + 쿼리 키 + TanStack Query 훅

  **What to do**:
  - `src/apis/user.ts` 생성:
    - `getUsers(params: GetUsersParams)` — GET /users (페이지네이션, 검색, 필터 파라미터 전달)
    - `getUser(id: string)` — GET /users/:id
    - `updateUser(id: string, data: UpdateUserPayload)` — PATCH /users/:id
    - `deleteUser(id: string)` — DELETE /users/:id
    - 기존 `src/apis/missionary.ts` 패턴 참조 (Axios 인스턴스 사용)
  - `src/lib/queryKeys.ts`에 `users` 키 추가:
    - `all: ['users']`, `list: (params) => [..., 'list', params]`, `detail: (id) => [..., 'detail', id]`
  - `src/app/(admin)/users/_hooks/` 디렉토리 생성:
    - `useGetUsers.ts` — `useQuery` + `getUsers` + `queryKeys.users.list`
    - `useGetUser.ts` — `useQuery` + `getUser` + `queryKeys.users.detail`
    - `useUpdateUser.ts` — `useMutation` + `updateUser` + invalidateQueries
    - `useDeleteUser.ts` — `useMutation` + `deleteUser` + invalidateQueries
  - 서버 사이드 fetch 함수: `createServerApi()` 활용한 SSR 데이터 페칭 (기존 missions page.tsx 패턴 참조)

  **Must NOT do**:
  - 기존 `queryKeys` 구조 변경 금지 (추가만)
  - 기존 API 인스턴스 (`instance.ts`, `serverInstance.ts`) 수정 금지

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 기존 패턴을 그대로 복제하여 엔드포인트만 변경하는 반복적 작업
  - **Skills**: [`tanstack-query`, `typescript`]
    - `tanstack-query`: useQuery/useMutation 패턴
    - `typescript`: 타입 정의

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8, 9)
  - **Blocks**: [Task 10, Task 11, Task 12]
  - **Blocked By**: Tasks 1, 2, 3, 4 (백엔드 API가 완성되어야 인터페이스 확정)

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/apis/missionary.ts` — API 모듈 패턴 (Axios 호출, 타입 제네릭)
  - `packages/client/missionary-admin/src/apis/missionGroup.ts` — 그룹 API 패턴
  - `packages/client/missionary-admin/src/apis/instance.ts` — Axios 클라이언트 인스턴스
  - `packages/client/missionary-admin/src/apis/serverInstance.ts` — 서버 사이드 API 인스턴스
  - `packages/client/missionary-admin/src/lib/queryKeys.ts:1-18` — 쿼리 키 구조 패턴
  - `packages/client/missionary-admin/src/app/(admin)/missions/_hooks/useGetMissionGroups.ts` — useQuery 훅 패턴
  - `packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/page.tsx` — SSR fetch 패턴 (`createServerApi()`)

  **API/Type References**:
  - Task 1에서 정의한 `GET /users` 응답: `{ data: User[], total, page, pageSize }`
  - Task 3에서 확장한 `PATCH /users/:id` 요청: `UpdateUserDto` (role 포함)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 쿼리 키 구조 확인
    Tool: Bash
    Steps:
      1. pnpm type-check 실행
      2. queryKeys.users.all, queryKeys.users.list(), queryKeys.users.detail('uuid') 타입 에러 없음
    Expected Result: 타입 체크 통과
    Evidence: .orchestrator/evidence/task-7-type-check.txt

  Scenario: API 모듈 import 확인
    Tool: Bash (node/bun REPL)
    Steps:
      1. 빌드 없이 타입 체크로 import 경로 검증
      2. getUsers, getUser, updateUser, deleteUser 함수가 export되는지 확인
    Expected Result: 모든 함수가 정상 export
    Evidence: .orchestrator/evidence/task-7-exports.txt
  ```

  **Commit**: YES (Wave 2 그룹 커밋)
  - Message: `feat(admin): 유저 API 모듈, 쿼리 키, 스키마 정의`
  - Files: `packages/client/missionary-admin/src/apis/user.ts`, `packages/client/missionary-admin/src/lib/queryKeys.ts`, `packages/client/missionary-admin/src/app/(admin)/users/_hooks/**`

- [ ] 8. Frontend: Zod 유효성 검증 스키마

  **What to do**:
  - `src/app/(admin)/users/_schemas/userSchema.ts` 생성:
    - `userUpdateSchema`: 수정 가능한 필드들의 Zod 스키마
      - `name`: z.string().min(1) (필수)
      - `phoneNumber`: z.string().optional()
      - `birthDate`: z.string().optional() (ISO date)
      - `gender`: z.enum(['MALE', 'FEMALE']).optional()
      - `isBaptized`: z.boolean()
      - `baptizedAt`: z.string().optional() (isBaptized가 true일 때만)
      - `role`: z.enum(['USER', 'STAFF', 'ADMIN']) (ADMIN만 수정 가능 — UI에서 제어)
    - `UserUpdateFormValues` 타입 export (`z.infer<typeof userUpdateSchema>`)
  - 기존 `_schemas/missionSchema.ts` 패턴 참조

  **Must NOT do**:
  - 읽기 전용 필드(email, provider, loginId)를 수정 스키마에 포함 금지
  - identityNumber를 수정 스키마에 포함 금지 (마스킹 토글은 조회용)
  - 비밀번호 관련 필드 추가 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Zod 스키마 정의는 단순 타입 매핑 작업
  - **Skills**: [`zod`, `typescript`]
    - `zod`: 스키마 정의 문법
    - `typescript`: 타입 추론

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 9)
  - **Blocks**: [Task 11]
  - **Blocked By**: None (Zod 스키마는 백엔드 의존 없이 정의 가능)

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/app/(admin)/missions/_schemas/missionSchema.ts` — Zod 스키마 패턴
  - `packages/client/missionary-admin/src/app/(admin)/missions/_schemas/missionGroupSchema.ts` — 그룹 스키마 패턴

  **API/Type References**:
  - `packages/server/missionary-server/src/user/dto/create-user.dto.ts:13-94` — 백엔드 DTO 필드 참조 (Zod 스키마 필드 매칭)
  - `packages/server/missionary-server/prisma/schema.prisma:64-101` — User 모델 필드

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 유효한 데이터 파싱
    Tool: Bash
    Steps:
      1. pnpm type-check 실행
      2. UserUpdateFormValues 타입이 정상 추론되는지 확인
    Expected Result: 타입 체크 통과
    Evidence: .orchestrator/evidence/task-8-schema-valid.txt

  Scenario: 필수 필드 누락 시 에러
    Tool: Bash (bun/node REPL)
    Steps:
      1. userUpdateSchema.safeParse({}) 호출
      2. success: false, name 필드 에러 확인
    Expected Result: name 필수 필드 에러 반환
    Evidence: .orchestrator/evidence/task-8-schema-error.txt
  ```

  **Commit**: YES (Wave 2 그룹 커밋)
  - Message: `feat(admin): 유저 API 모듈, 쿼리 키, 스키마 정의`
  - Files: `packages/client/missionary-admin/src/app/(admin)/users/_schemas/userSchema.ts`

- [ ] 9. Frontend: MSW 핸들러 + Mock 데이터

  **What to do**:
  - `src/test/mocks/data.ts`에 추가:
    - `createMockUser()` — 전체 User 객체 mock (모든 필드 포함)
    - `createMockUserList(count: number)` — 목록용 mock 배열 생성
  - `src/test/mocks/handlers.ts`에 유저 관련 핸들러 추가:
    - `GET /users` — 페이지네이션 응답 mock (`{ data, total, page, pageSize }`)
    - `GET /users/:id` — 단건 조회 mock
    - `PATCH /users/:id` — 수정 응답 mock
    - `DELETE /users/:id` — 삭제 응답 mock (204)
  - 기존 missionaries/mission-groups 핸들러 패턴 참조

  **Must NOT do**:
  - 기존 핸들러 수정 금지 (추가만)
  - MSW 서버 설정(`server.ts`) 수정 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 기존 MSW 핸들러 패턴을 복제하여 엔드포인트만 변경
  - **Skills**: [`msw`, `typescript`]
    - `msw`: HTTP 핸들러 정의 패턴
    - `typescript`: Mock 데이터 타입

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8)
  - **Blocks**: [Task 14]
  - **Blocked By**: Tasks 1, 2, 3 (API 응답 형식 확정 필요)

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/test/mocks/handlers.ts:1-75` — 기존 MSW 핸들러 패턴 (missionaries, mission-groups, auth)
  - `packages/client/missionary-admin/src/test/mocks/data.ts` — `createMockAuthUser()`, `createMockMissionary()` mock 팩토리 패턴
  - `packages/client/missionary-admin/src/test/mocks/server.ts` — MSW 서버 설정

  **API/Type References**:
  - Task 1 응답 형식: `{ data: User[], total: number, page: number, pageSize: number }`
  - `packages/server/missionary-server/prisma/schema.prisma:64-101` — User 모델 필드 (mock 데이터 구조)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: MSW 핸들러 동작 확인
    Tool: Bash
    Steps:
      1. pnpm --filter missionary-admin test -- --run (기존 테스트가 깨지지 않는지 확인)
      2. 새 핸들러가 기존 핸들러와 충돌하지 않는지 확인
    Expected Result: 기존 테스트 전체 통과
    Evidence: .orchestrator/evidence/task-9-msw-no-regression.txt

  Scenario: Mock 데이터 타입 검증
    Tool: Bash
    Steps:
      1. pnpm type-check 실행
      2. createMockUser() 반환 타입이 User 인터페이스와 일치하는지 확인
    Expected Result: 타입 체크 통과
    Evidence: .orchestrator/evidence/task-9-mock-type.txt
  ```

  **Commit**: YES (Wave 2 그룹 커밋)
  - Message: `feat(admin): 유저 API 모듈, 쿼리 키, 스키마 정의`
  - Files: `packages/client/missionary-admin/src/test/mocks/data.ts`, `packages/client/missionary-admin/src/test/mocks/handlers.ts`

- [ ] 10. Frontend: 유저 목록 페이지 + 테이블 + 검색/필터

  **What to do**:
  - `src/app/(admin)/users/page.tsx` 생성:
    - 서버 컴포넌트, `createServerApi()`로 초기 유저 목록 SSR fetch
    - `<UsersPageClient>` 클라이언트 컴포넌트에 초기 데이터 전달
  - `src/app/(admin)/users/layout.tsx` 생성:
    - 유저 목록 + 상세 패널을 감싸는 레이아웃 (flex row)
  - `src/app/(admin)/users/_components/UsersPageClient.tsx`:
    - 상태 관리: `selectedUserId`, `searchParams` (page, search, role, provider, isBaptized)
    - `useGetUsers(params)` 훅으로 데이터 페칭 (initialData hydration)
    - `<UserSearchFilter>` + `<UserTable>` + `<UserDetailPanel>` + `<Pagination>` 조합
  - `src/app/(admin)/users/_components/UserSearchFilter.tsx`:
    - 디자인 시스템 `SearchBox` 사용 (이름/이메일 검색)
    - `Select` 컴포넌트로 역할(USER/STAFF/ADMIN), 인증방식(LOCAL/GOOGLE/KAKAO), 세례여부 필터
    - 디바운싱 적용 (검색어 입력 시)
  - `src/app/(admin)/users/_components/UserTable.tsx`:
    - 가로 스크롤 테이블 (`overflow-x-auto`)
    - 이름 컬럼 sticky (`sticky left-0 z-10 bg-white`)
    - 컬럼: 이름, 이메일, 역할, 인증방식, 로그인ID, 전화번호, 생년월일, 성별, 세례여부, 주민번호(마스킹), 가입일
    - 행 클릭 시 `onSelectUser(id)` 콜백 호출
    - 선택된 행 하이라이트 (`bg-blue-50`)
    - 디자인 시스템 `Badge` 컴포넌트로 역할/인증방식 표시
  - 디자인 시스템 `Pagination` 컴포넌트 사용 (오프셋 기반)

  **Must NOT do**:
  - 유저 생성 버튼/기능 추가 금지
  - 복합 검색 (AND/OR), 날짜 범위 필터 금지
  - 디자인 시스템에 없는 커스텀 UI 컴포넌트 과도 생성 금지
  - CSV/Excel 내보내기 기능 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 가로 스크롤 테이블, sticky 컬럼, 반응형 레이아웃 등 정밀한 UI 구현
  - **Skills**: [`react`, `tailwindcss`, `tanstack-query`]
    - `react`: 서버/클라이언트 컴포넌트, 상태 관리
    - `tailwindcss`: 테이블 스타일, sticky 포지셔닝
    - `tanstack-query`: useQuery, 캐시 하이드레이션

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11, 12)
  - **Blocks**: [Task 14]
  - **Blocked By**: Tasks 7, 3 (API 모듈 + 권한 정의 필요)

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/_components/MissionGroupDetail.tsx` — 테이블 스타일 패턴 (`bg-white rounded-xl border border-gray-30 shadow-sm`, 헤더 `px-5 py-3 text-xs font-medium text-gray-50`, 행 `hover:bg-gray-10 transition-colors`)
  - `packages/client/missionary-admin/src/app/(admin)/missions/page.tsx` — 서버 컴포넌트 SSR fetch 패턴
  - `packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/page.tsx` — `createServerApi()` + `notFound()` 패턴
  - `packages/client/missionary-admin/src/app/(admin)/missions/layout.tsx` — 레이아웃 구조 (flex 기반)
  - `packages/client/missionary-admin/src/app/(admin)/missions/_components/GroupPanel.tsx` — 검색 + 필터 + 리스트 패턴

  **External References**:
  - `.orchestrator/drafts/mockups/user-management-full.html` — 확정된 UI 목업 (테이블 레이아웃, 컬럼 순서, 스타일)

  **API/Type References**:
  - Task 7의 `useGetUsers` 훅, `queryKeys.users.list`
  - `@samilhero/design-system` — SearchBox, Select, Pagination, Badge 컴포넌트

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 유저 목록 테이블 렌더링
    Tool: Vitest + Testing Library
    Steps:
      1. UsersPageClient 렌더 (MSW mock 데이터)
      2. 테이블 헤더 컬럼 존재 확인 (이름, 이메일, 역할 등)
      3. 유저 행 데이터 렌더 확인
    Expected Result: 테이블에 유저 데이터 정상 표시
    Evidence: .orchestrator/evidence/task-10-table-render.txt

  Scenario: 가로 스크롤 + 이름 sticky
    Tool: Vitest + Testing Library
    Steps:
      1. UserTable 컴포넌트 렌더
      2. 테이블 컨테이너에 overflow-x-auto 클래스 존재 확인
      3. 이름 컬럼 셀에 sticky 클래스 존재 확인
    Expected Result: 스크롤 가능하고 이름 고정
    Evidence: .orchestrator/evidence/task-10-sticky-scroll.txt

  Scenario: 행 클릭 시 콜백 호출
    Tool: Vitest + Testing Library
    Steps:
      1. UserTable에 onSelectUser mock 함수 전달
      2. 첫 번째 행 클릭
      3. onSelectUser가 해당 유저 ID로 호출되었는지 확인
    Expected Result: onSelectUser(userId) 호출됨
    Evidence: .orchestrator/evidence/task-10-row-click.txt
  ```

  **Commit**: YES (Wave 3 그룹 커밋)
  - Message: `feat(admin): 유저 관리 페이지 UI 구현`
  - Files: `packages/client/missionary-admin/src/app/(admin)/users/**`

- [ ] 11. Frontend: 유저 상세/수정 패널 (UserDetailPanel)

  **What to do**:
  - `src/app/(admin)/users/_components/UserDetailPanel.tsx` 생성:
    - 우측 560px 슬라이드 패널 (`fixed right-0 top-0 h-full w-[560px] z-30`)
    - 슬라이드 애니메이션: `transform translate-x-full → translate-x-0` transition
    - `useGetUser(selectedUserId)` 훅으로 상세 데이터 페칭
    - `useForm` + `zodResolver(userUpdateSchema)` 연동
    - **수정 가능 필드** (react-hook-form 제어):
      - 이름, 전화번호, 생년월일, 성별, 세례여부, 세례일, 역할(ADMIN만)
    - **읽기 전용 필드** (disabled input 또는 텍스트 표시):
      - 이메일, 인증방식(provider), 로그인ID
    - **주민번호 토글** (ADMIN만):
      - 기본: 마스킹 표시 (예: "990101-1******")
      - 보기 버튼 클릭 → `GET /users/:id` 재호출 (ADMIN이면 마스킹 해제된 원본 반환)
      - 숨기기 버튼 클릭 → 마스킹 표시로 복원
    - **Dirty check**: `formState.isDirty`로 변경 감지
      - 변경 시: 저장 + 되돌리기 버튼 활성화
      - 미변경 시: 버튼 비활성화 (disabled)
    - **저장**: `useUpdateUser` mutation → 성공 시 목록 + 상세 캐시 invalidate
    - **되돌리기**: `form.reset()` 호출
    - **역할 기반 UI**:
      - ADMIN: 모든 수정 가능 필드 활성화 + 삭제 버튼 표시
      - STAFF: 모든 필드 disabled + 삭제 버튼 숨김
    - **시스템 정보**: 하단에 읽기 전용 (가입일, 수정일, 생성자, 수정자, 버전)
    - 닫기 버튼 (X 아이콘 또는 패널 외부 클릭)

  **Must NOT do**:
  - 별도 수정 페이지/라우트 생성 금지 (패널 내 인라인 수정)
  - 비밀번호 관리/리셋 필드 추가 금지
  - 패널 오픈 시 목록 영역 블러 처리 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 슬라이드 패널 애니메이션, 복합 폼 상태 관리, 역할별 UI 분기
  - **Skills**: [`react`, `react-hook-form`, `tailwindcss`, `zod`]
    - `react`: 클라이언트 컴포넌트, 상태 관리
    - `react-hook-form`: useForm, zodResolver, dirty check, reset
    - `tailwindcss`: 슬라이드 패널 스타일, 애니메이션
    - `zod`: 유효성 검증

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 12)
  - **Blocks**: [Task 14]
  - **Blocked By**: Tasks 7, 8 (API 모듈 + Zod 스키마 필요)

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/app/(admin)/missions/_components/GroupPanel.tsx` — 사이드 패널 구조 (260px aside, 스크롤)
  - `packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/[missionId]/edit/_components/MissionaryEditForm.tsx:29-66` — react-hook-form + zodResolver + useTransition 패턴
  - `packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/[missionId]/edit/_components/DeleteConfirmModal.tsx` — 모달/패널 UI 패턴

  **External References**:
  - `.orchestrator/drafts/mockups/user-management-full.html` — 확정된 패널 목업 (필드 배치, 읽기 전용 영역, dirty check UI)

  **API/Type References**:
  - Task 7의 `useGetUser`, `useUpdateUser` 훅
  - Task 8의 `userUpdateSchema`, `UserUpdateFormValues`
  - `@samilhero/design-system` — Input, Select, Button, Switch, Radio 컴포넌트

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 패널 오픈/닫기
    Tool: Vitest + Testing Library
    Steps:
      1. selectedUserId 설정 시 패널 DOM에 존재 확인
      2. 닫기 버튼 클릭 시 패널 제거 확인
    Expected Result: 패널 토글 정상 동작
    Evidence: .orchestrator/evidence/task-11-panel-toggle.txt

  Scenario: Dirty check + 저장/되돌리기
    Tool: Vitest + Testing Library
    Steps:
      1. 패널 렌더 (유저 데이터 로드)
      2. 이름 필드 변경 → 저장/되돌리기 버튼 활성화 확인
      3. 되돌리기 클릭 → 원래 값 복원 + 버튼 비활성화 확인
    Expected Result: dirty check로 버튼 상태 전환
    Evidence: .orchestrator/evidence/task-11-dirty-check.txt

  Scenario: STAFF 읽기 전용 모드
    Tool: Vitest + Testing Library
    Steps:
      1. STAFF 역할 유저로 패널 렌더
      2. 모든 입력 필드가 disabled인지 확인
      3. 삭제 버튼이 없는지 확인
    Expected Result: STAFF는 조회만 가능
    Evidence: .orchestrator/evidence/task-11-staff-readonly.txt

  Scenario: 읽기 전용 필드 보호
    Tool: Vitest + Testing Library
    Steps:
      1. ADMIN으로 패널 렌더
      2. 이메일, 인증방식, 로그인ID 필드가 disabled/readonly인지 확인
    Expected Result: 읽기 전용 필드 수정 불가
    Evidence: .orchestrator/evidence/task-11-readonly-fields.txt
  ```

  **Commit**: YES (Wave 3 그룹 커밋)
  - Message: `feat(admin): 유저 관리 페이지 UI 구현`
  - Files: `packages/client/missionary-admin/src/app/(admin)/users/_components/UserDetailPanel.tsx`

- [ ] 12. Frontend: 유저 삭제 모달 (DeleteUserModal)

  **What to do**:
  - `src/app/(admin)/users/_components/DeleteUserModal.tsx` 생성:
    - 확인 모달: "정말 삭제하시겠습니까?" + 유저 이름 표시
    - "30일 후 영구 삭제됩니다" 안내 문구
    - 확인/취소 버튼 (디자인 시스템 Button 사용)
    - `useDeleteUser` mutation 호출 → 성공 시 패널 닫기 + 목록 캐시 invalidate
    - 에러 처리: 자기 삭제/마지막 ADMIN 에러 시 에러 메시지 표시
  - 기존 `DeleteConfirmModal.tsx` 패턴 참조

  **Must NOT do**:
  - 삭제된 유저 복구 기능 추가 금지
  - 일괄 삭제 기능 추가 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 기존 DeleteConfirmModal 패턴을 복제하여 내용만 변경하는 단순 작업
  - **Skills**: [`react`, `tailwindcss`]
    - `react`: 모달 상태 관리
    - `tailwindcss`: 모달 스타일

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 11)
  - **Blocks**: [Task 14]
  - **Blocked By**: Task 7 (useDeleteUser mutation 필요)

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/[missionId]/edit/_components/DeleteConfirmModal.tsx` — 삭제 확인 모달 패턴 (구조, 스타일, 콜백)
  - `packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/[missionId]/edit/_components/DeleteMissionSection.tsx` — 삭제 섹션 패턴

  **External References**:
  - `.orchestrator/drafts/mockups/user-management-full.html` — 삭제 모달 목업 ("30일 후 영구 삭제" 안내)

  **API/Type References**:
  - Task 7의 `useDeleteUser` mutation
  - `@samilhero/design-system` — Button 컴포넌트 (variant: destructive/danger)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 삭제 모달 표시 + 취소
    Tool: Vitest + Testing Library
    Steps:
      1. 삭제 버튼 클릭 → 모달 표시 확인
      2. "30일 후 영구 삭제" 문구 존재 확인
      3. 취소 버튼 클릭 → 모달 닫힘 확인
    Expected Result: 모달 표시/닫기 정상, 안내 문구 포함
    Evidence: .orchestrator/evidence/task-12-modal-cancel.txt

  Scenario: 삭제 확인
    Tool: Vitest + Testing Library
    Steps:
      1. 모달에서 확인 버튼 클릭
      2. useDeleteUser mutation 호출 확인
      3. 성공 시 모달 닫힘 + 패널 닫힘 확인
    Expected Result: 삭제 API 호출 + UI 정리
    Evidence: .orchestrator/evidence/task-12-modal-confirm.txt

  Scenario: 삭제 에러 처리
    Tool: Vitest + Testing Library
    Steps:
      1. MSW에서 DELETE /users/:id 400 에러 반환하도록 설정
      2. 확인 버튼 클릭 → 에러 메시지 표시 확인
    Expected Result: 에러 메시지 사용자에게 표시
    Evidence: .orchestrator/evidence/task-12-modal-error.txt
  ```

  **Commit**: YES (Wave 3 그룹 커밋)
  - Message: `feat(admin): 유저 관리 페이지 UI 구현`
  - Files: `packages/client/missionary-admin/src/app/(admin)/users/_components/DeleteUserModal.tsx`

- [ ] 13. Frontend: 유저 관리 UI 테스트

  **What to do**:
  - `src/app/(admin)/users/__tests__/` 또는 `_components/__tests__/` 디렉토리 생성:
    - `UserTable.test.tsx`:
      - 테이블 렌더링 (컬럼 헤더, 데이터 행)
      - 행 클릭 이벤트
      - 빈 상태 표시
    - `UserDetailPanel.test.tsx`:
      - 패널 오픈/닫기
      - 읽기 전용 필드 확인
      - Dirty check (변경 → 저장/되돌리기 버튼 활성화)
      - STAFF 읽기 전용 모드
      - 폼 제출 (updateUser mutation 호출 확인)
    - `DeleteUserModal.test.tsx`:
      - 모달 표시/닫기
      - 삭제 확인 → mutation 호출
      - 에러 표시
    - `UserSearchFilter.test.tsx`:
      - 검색어 입력 → 디바운싱 → 콜백 호출
      - 필터 선택 → 콜백 호출
  - Vitest + Testing Library + MSW mock 서버 사용
  - `src/test/setup.ts`의 기존 설정 활용

  **Must NOT do**:
  - 기존 테스트 수정/삭제 금지
  - E2E 테스트 (Playwright 등) 추가 금지

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 다수 컴포넌트의 상호작용 테스트, MSW 연동, 폼 상태 검증 등 복합적
  - **Skills**: [`vitest`, `testing-library`, `msw`, `react`]
    - `vitest`: 테스트 러너
    - `testing-library`: 렌더, 이벤트, 쿼리
    - `msw`: API 모킹
    - `react`: 컴포넌트 테스트

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4에서 단독 실행)
  - **Parallel Group**: Wave 4
  - **Blocks**: [F1-F4]
  - **Blocked By**: Tasks 9, 10, 11, 12 (MSW 핸들러 + UI 컴포넌트 완성 필요)

  **References**:

  **Pattern References**:
  - `packages/client/missionary-admin/src/test/setup.ts` — 테스트 셋업 (MSW 서버 시작/정지, cleanup)
  - `packages/client/missionary-admin/src/test/mocks/server.ts` — MSW 서버 인스턴스
  - `packages/client/missionary-admin/src/test/mocks/handlers.ts` — 기존 핸들러 구조
  - `packages/client/missionary-admin/vitest.config.ts:108-112` — `environment: 'jsdom'`, `globals: true`, setupFiles
  - 기존 `*.test.tsx` 파일 패턴 검색 (Testing Library 사용법)

  **API/Type References**:
  - Task 9의 MSW 핸들러 + mock 데이터 (`createMockUser`, `createMockUserList`)
  - Task 8의 `userUpdateSchema`

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 프론트엔드 테스트 전체 통과
    Tool: Bash
    Steps:
      1. pnpm --filter missionary-admin test -- --run
      2. 모든 테스트 PASS 확인
    Expected Result: 0 failures, 신규 테스트 포함 전체 통과
    Evidence: .orchestrator/evidence/task-13-frontend-tests.txt

  Scenario: 기존 테스트 회귀 없음
    Tool: Bash
    Steps:
      1. 기존 테스트만 실행
      2. 기존 테스트 전부 PASS 확인
    Expected Result: 기존 테스트 깨지지 않음
    Evidence: .orchestrator/evidence/task-13-no-regression.txt
  ```

  **Commit**: YES (Wave 4 그룹 커밋)
  - Message: `test(admin): 유저 관리 프론트엔드 테스트 추가`
  - Files: `packages/client/missionary-admin/src/app/(admin)/users/**/*.test.tsx`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `pnpm type-check` + `pnpm lint:all` + `pnpm --filter missionary-server test` + `pnpm --filter missionary-admin test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Execute EVERY QA scenario from EVERY task. Test cross-task integration. Test edge cases.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `unspecified-high`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec was built. Detect cross-task contamination.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat(server): 유저 API 페이지네이션, 소프트 삭제, 권한 확장` — backend 구현 + 테스트 파일 포함 (TDD)
- **Wave 2**: `feat(admin): 유저 API 모듈, 쿼리 키, 스키마 정의` — frontend api/lib files
- **Wave 3**: `feat(admin): 유저 관리 페이지 UI 구현` — frontend components
- **Wave 4**: `test(admin): 유저 관리 프론트엔드 테스트 추가` — frontend test files

---

## Success Criteria

### Verification Commands
```bash
pnpm --filter missionary-server test     # Expected: ALL PASS
pnpm --filter missionary-admin test      # Expected: ALL PASS
pnpm type-check                          # Expected: 0 errors
pnpm lint:all                            # Expected: 0 errors
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] Existing tests not broken
