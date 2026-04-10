# Missionary Server CLAUDE.md

## Overview

`missionary-server`는 NestJS API 서버다. Prisma(PostgreSQL) 기반이며, 인증/OAuth/도메인 모듈을 `src/*` 경계로 분리한다.

## Entry Points

- `src/main.ts` (bootstrap)
- `src/app.module.ts` (module graph)
- `prisma/schema.prisma` (DB schema)
- `prisma.config.ts` (Prisma CLI config)

## Domain Glossary

`src/<domain>` 단위로 11개 도메인 모듈이 등록된다 (`app.module.ts`의 `imports[]` 순서: `User → Auth → MissionGroup → Church → Missionary → Staff → Participation → Team → Board → Terms`).
`PrismaModule`은 `@Global`이라 어디서든 `PrismaService` inject 가능. `JwtAuthGuard` + `RolesGuard`가 `APP_GUARD`로 등록되어 모든 라우트에 기본 적용된다 (Public 데코레이터로 opt-out).

| 도메인 | 책임 | 주요 엔드포인트 | 의존/관계 |
|---|---|---|---|
| `auth` | 로그인/JWT/OAuth(Google·Kakao). 토큰 발급·갱신·로그아웃 | `POST /auth/login`, `/auth/admin/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me`, `/auth/{google,kakao}[/callback]`, `PATCH /auth/change-password` | → user |
| `user` | 사용자 계정 CRUD. PII 필드(주민번호 등) AES 암호화 | `/users` (POST/GET/GET :id/PATCH :id/DELETE :id) | ← auth, → 대부분 도메인이 FK로 참조 |
| `mission-group` | 선교 모임 그룹. `category` enum으로 국내/해외 구분 | `/mission-groups` (POST/GET/GET :id/PATCH :id/DELETE :id) | → Missionary[], MissionaryRegion[] |
| `missionary` | **fat 도메인** — 선교 이벤트 + 폼 빌더 + 참석 옵션 + 지역 관리. 5개 컨트롤러 보유 | `/missionaries` (CRUD), `PATCH :id/accepting-responses`(폼 토글), `/missionaries/:id/posters`, `/missionaries/:missionaryId/form-fields`, `/missionaries/:missionaryId/attendance-options`, `/regions`, `/mission-groups/:id/regions` | → mission-group, user(creator); ← participation·team·board·staff·formField·attendanceOption |
| `participation` | 모집 신청·납부 승인·폼 응답·CSV 다운로드 | `/participations` (CRUD), `PUT /approve`, `GET /enrollment-summary/:missionaryId`, `GET /download/:missionaryId`, `PATCH :id/answers` (DnD 배치: PATCH :id body의 teamId 필드) | → missionary, user, team?, attendanceOption?, formField (FormAnswer 조인) |
| `team` | 팀 배치 + 팀 멤버십 | `/teams` (CRUD), `PUT :id/members`, `DELETE :id/members` | → missionary, church?, missionaryRegion?; ← TeamMember/User |
| `staff` | 선교 스태프 (LEADER/MEMBER role) | `/staff` (POST/GET/GET :id/PATCH :id/DELETE :id) | → missionary, user (`MissionaryStaff` 조인) |
| `church` | 교회 마스터. team이 선택적으로 참조 | `/churches` (POST/GET/GET :id/PATCH :id/DELETE :id) | ← team |
| `board` | 선교별 게시판. type 5종(NOTICE/BUS/ACCOMMODATION/FAQ/SCHEDULE) | `POST/GET /missionaries/:missionaryId/boards`, `GET/PATCH/DELETE /boards/:id` | → missionary, MissionaryBoardFile |
| `terms` | 약관(4종) + 사용자 동의 + 약관 본문 버저닝 | `/terms` (CRUD), `POST :id/agreements`, `GET users/:userId/agreements` | → user (UserTermsAgreement 조인) |
| `database` | `PrismaService` 글로벌 export (모듈 파일명: `prisma.module.ts`, `@Global`) | (라우트 없음) | 모든 도메인이 자동 inject |
| `common` | NestJS 전역 인프라 — 도메인 아님. 아래 인덱스 참조 | (라우트 없음) | (전역) |
| `testing` | factory 12개 + InMemory fake repository 16개. **NestJS 모듈이 아니다** (`testing.module.ts` 부재) — `*.spec.ts`에서 직접 import해서 사용한다 | (라우트 없음) | (테스트 전용, non-module) |

### Cross-Module Cross-Reference Patterns (Non-Obvious)

도메인 간 의존성에는 일반적이지 않은 패턴이 몇 가지 있다. **새 cross-domain 참조를 추가하기 전에 반드시 읽는다.**

1. **`mission-group` ↔ `missionary` 순환 참조 회피** — 두 모듈은 서로를 `imports[]`에 넣지 않는다. 대신 각자 상대 Repository 토큰을 자기 `providers[]`에 직접 바인딩한다.
   - `MissionaryModule.providers`: `{ provide: MISSION_GROUP_REPOSITORY, useClass: PrismaMissionGroupRepository }` (`missionary.module.ts`)
   - `MissionGroupModule.providers`: `{ provide: MISSIONARY_REPOSITORY, useClass: PrismaMissionaryRepository }` (`mission-group.module.ts`)
   - **새 cross-domain 참조를 추가할 때 두 모듈 사이에 순환이 생길 가능성이 있으면 import가 아니라 이 패턴을 따른다.**

2. **`AuthModule` → `UserModule` import**: `auth.module.ts`가 `UserModule`을 직접 import해서 `UserService`를 소비한다 (단방향).

3. **`ParticipationModule` → `MissionaryModule` import + BullMQ 큐 이중 등록**: `participation.module.ts`가 `MissionaryModule`을 import하고, 추가로 `BullModule.registerQueue({ name: 'participation-queue' })`를 한다. 즉 Bull 연결은 `common/queue/bull.module.ts`(`@Global`)가 담당하고, **큐 이름 바인딩은 도메인별로** 수행한다. `ParticipationProcessor`가 이 큐를 소비한다.

4. **`BoardController`는 `@Controller()` prefix 없음**: `POST /missionaries/:missionaryId/boards`와 `GET|PATCH|DELETE /boards/:id`가 한 컨트롤러에 혼재한다 (`board.controller.ts`). 다른 도메인과 다른 패턴이므로 라우트 검색 시 주의.

5. **OAuth 콜백 분기**: `auth.controller.ts`의 `/auth/{google,kakao}/callback`은 `req.query.state === 'app'` 여부로 `APP_CLIENT_URL` vs `ADMIN_CLIENT_URL`로 리다이렉트한다.

6. **`TeamModule` → `MissionaryModule` 단방향 import**: `team.module.ts`가 `MissionaryModule`을 직접 import한다. `TeamService`는 `MISSIONARY_REPOSITORY`와 `MISSIONARY_REGION_REPOSITORY`를 inject받아 region-missionGroup 소속 검증을 수행한다. 순환이 아닌 단방향이므로 mission-group ↔ missionary 같은 token 바인딩 패턴은 사용하지 않는다.

## Prisma Schema (Mental Model)

`prisma/schema.prisma` (622 LOC) 핵심 관계만 압축. 자세한 필드는 schema를 직접 참조.

```text
User  ─── auth + user 도메인. role: USER|ADMIN|STAFF, PII 보유
  │
  ├─→ Missionary             (creator FK)
  ├─→ MissionaryStaff   → Missionary    [LEADER | MEMBER 조인]
  ├─→ Participation     → Missionary    [신청·납부, FormAnswer 보유]
  ├─→ TeamMember        → Team
  └─→ UserTermsAgreement → Terms

MissionGroup  [category: DOMESTIC | ABROAD]
  ├─→ Missionary[]
  └─→ MissionaryRegion[]   (그룹 산하 지역, 2026-03-20 기능)

Missionary   [선교 이벤트 — 가장 많은 관계를 보유한 핵심 엔티티]
  │  status: ENROLLMENT_OPENED | ENROLLMENT_CLOSED | IN_PROGRESS | COMPLETED
  │  isAcceptingResponses (2026-04-03 폼 토글 기능)
  ├─→ MissionaryPoster[]
  ├─→ MissionaryBoard[]            → MissionaryBoardFile[]
  ├─→ MissionaryFormField[]   ↘   [폼 빌더, 2026-03-25]
  │     type: TEXT|TEXTAREA|NUMBER|BOOLEAN|SELECT|DATE
  ├─→ MissionaryAttendanceOption[]  type: FULL | PARTIAL
  ├─→ Participation[] ──┬─→ ParticipationFormAnswer[] ↙
  │                     └─→ Team?
  └─→ Team[] ──→ TeamMember[], Church?, MissionaryRegion?

Terms ─→ UserTermsAgreement (N:M 사용자 동의 기록)
TermsContent (별도 테이블, 약관 본문 버저닝)
```

**주의 포인트:**

- **PII 암호화 대상 필드**: `User.identityNumber`, `Participation.identificationNumber`. service layer에서 `EncryptionService`(`common/encryption`)를 경유한다. 평문으로 다루지 않는다.
- **Soft delete**: 모든 모델이 `deletedAt` 필드를 보유한다. Prisma 쿼리에서 `where: { deletedAt: null }` 누락에 주의한다.
- **Audit fields**: 모든 모델에 `createdBy/updatedBy/createdAt/updatedAt/version`. `version`은 optimistic locking 용도.
- **MissionaryRegion 통합**: 구 `missionary_region` 테이블의 국내/해외 구분은 `MissionGroup.category` enum으로 통합되었다 (`schema.prisma:121` 주석). 새 코드는 `MissionGroup.category`를 진실의 원천으로 사용한다.
- **Legacy 필드**: `Participation.memberId`는 Spring 마이그레이션 잔재(`// Legacy field from Spring`). 새 로직에서 사용 금지.
- **`@@map`**: 모델 이름은 PascalCase, 테이블명은 snake_case로 매핑된다.

## common/ Module Index

`src/common/`은 **도메인이 아니라 NestJS 전역 인프라**다. 새 비즈니스 로직을 절대 여기에 추가하지 않는다.

| 폴더 | 책임 | 등록 위치 / 사용처 |
|---|---|---|
| `config/` | 환경변수 검증 | `env.validation.ts` → `app.module.ts`의 `ConfigModule.forRoot.validate` |
| `csv/` | CSV 변환 | `csv-export.service.ts` → participation 다운로드 |
| `decorators/` | 커스텀 데코레이터 | `Public` (가드 opt-out), `Roles` (RolesGuard 메타데이터) 등 |
| `encryption/` | PII `aes-128-cbc` 암호화 (`AES_ENCRYPT_KEY` 환경변수 기반, backward-compat 사유로 약한 알고리즘 — 신규 키 도입 시 주의) | `encryption.module.ts` + `encryption.service.ts` → User/Participation service에 inject |
| `enums/` | 공통 enum | 도메인 간 공유 |
| `filters/` | 전역 예외 필터 | `main.ts`의 `useGlobalFilters` (HttpExceptionFilter 등) |
| `guards/` | 권한 가드 | `RolesGuard` → `app.module.ts`에서 `APP_GUARD`로 전역 등록 |
| `interceptors/` | 응답 인터셉터 | `MaskingInterceptor` → `app.module.ts`에서 `APP_INTERCEPTOR`로 전역 등록 (PII 마스킹) |
| `interfaces/` | 공통 인터페이스 타입 | 도메인 간 공유 타입 |
| `providers/` | 공통 DI provider | `bcrypt-password-hasher.ts` (`PasswordHasher` 토큰) |
| `queue/` | BullMQ wrapper | `bull.module.ts` → `app.module.ts`에 `BullModule`로 등록 |
| `repositories/` | Repository 베이스 인터페이스 | `base-repository.interface.ts` → 각 도메인 repository가 구현 |
| `scheduler/` | 크론 작업 | `pii-cleanup.scheduler.ts` — 매일 자정(`@Cron('0 0 * * *')`) 30일 이상 soft-delete된 `participation.identificationNumber`를 null로 비움 |
| `utils/` | 공통 헬퍼 함수 | `encryption.ts`(함수형 encrypt/decrypt), `retry.ts`(Prisma/pg transient 에러 판별 + 재시도) |

## Runtime Conventions

- 기본 포트는 `3100`이며 실제 값은 `ConfigService` 환경 변수 우선.
- `main.ts`에서 전역 CORS, ValidationPipe, HttpExceptionFilter, MaskingInterceptor를 설정한다.
- 인증/OAuth 정책은 `src/auth/**`에서만 관리한다.
- 도메인 비즈니스 로직은 `src/<domain>/*.service.ts`에 두고 controller는 thin 하게 유지한다.

## Test And Build

- Jest 설정은 `jest.config.ts` 기준(`rootDir: src`, `testRegex: .*\.spec\.ts$`).
- 테스트 코드를 작성·수정할 때는 반드시 `nestjs-testing` 스킬을 로드하고 따른다.
- 핵심 원칙: 계약(행동)을 테스트하고, 구현 세부사항을 테스트하지 않는다.
- Mock 전략: Repository는 Fake(InMemory 구현) 선호, 외부 서비스(이메일 등)만 Stub/Mock 사용.
- 복잡한 비즈니스 로직은 순수 함수로 추출(Functional Core)하여 Mock 없이 테스트한다.
- 테스트 이름은 행동 기반 한글 서술: `it('중복 이메일로 등록하면 ConflictException을 던진다')`.
- 빌드 산출물은 `dist/`이며 실행 엔트리는 `node dist/main`.
- Prisma client/migration은 패키지 스크립트를 사용한다.

## Where To Look

| Task            | Location                                                   | Notes                        |
| --------------- | ---------------------------------------------------------- | ---------------------------- |
| Auth/OAuth flow | `src/auth`                                                 | strategies, guards, filters  |
| Global infra    | `src/common`, `src/database`                               | interceptors, prisma service |
| Mission domains | `src/mission-group`, `src/missionary`, `src/participation` | 핵심 비즈니스                |
| DB workflow     | `prisma`, `prisma.config.ts`                               | generate + migrations        |
| Deployment      | `Dockerfile`, `docker-compose.prod.yml`                    | prod runtime                 |

## Anti-Patterns

- DTO/validation 없이 요청 body를 service에 직접 전달하지 않는다.
- Prisma migration 없이 schema 변경을 배포하지 않는다.
- 인증 관련 토큰/쿠키 정책을 controller 외부에서 중복 구현하지 않는다.

## Commands

```bash
pnpm --filter missionary-server dev
pnpm --filter missionary-server test
pnpm --filter missionary-server test:cov
pnpm --filter missionary-server build
pnpm --filter missionary-server prisma:generate
pnpm --filter missionary-server prisma:migrate:dev
pnpm --filter missionary-server prisma:migrate:deploy
```
