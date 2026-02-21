# Missionary Server CLAUDE.md

이 파일은 `packages/server/missionary-server/**` 전용 규칙이다. 상위 규칙은 `../CLAUDE.md`를 따른다.

## Overview

`missionary-server`는 NestJS API 서버다. Prisma(PostgreSQL) 기반이며, 인증/OAuth/도메인 모듈을 `src/*` 경계로 분리한다.

## Entry Points

- `src/main.ts` (bootstrap)
- `src/app.module.ts` (module graph)
- `prisma/schema.prisma` (DB schema)
- `prisma.config.ts` (Prisma CLI config)

## Runtime Conventions

- 기본 포트는 `3100`이며 실제 값은 `ConfigService` 환경 변수 우선.
- `main.ts`에서 전역 CORS, ValidationPipe, HttpExceptionFilter, MaskingInterceptor를 설정한다.
- 인증/OAuth 정책은 `src/auth/**`에서만 관리한다.
- 도메인 비즈니스 로직은 `src/<domain>/*.service.ts`에 두고 controller는 thin 하게 유지한다.

## Test And Build

- Jest 설정은 `jest.config.ts` 기준(`rootDir: src`, `testRegex: .*\.spec\.ts$`).
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

- `dist/`를 직접 수정하지 않는다.
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
