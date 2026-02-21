# Server (Backend) CLAUDE.md

이 파일은 `packages/server/**` 공통 규칙이다. 루트 규칙은 `../../CLAUDE.md`를 따른다.

## Scope

- `missionary-server`

## Child CLAUDE File

- `./missionary-server/CLAUDE.md`

## Shared Stack

- NestJS 11
- Prisma ORM + PostgreSQL
- TypeScript 5.9 (`moduleResolution: node`, CommonJS)

## Shared Architecture

- NestJS의 Module/Controller/Service 분리를 유지한다.
- Controller는 요청/응답 처리만 담당하고 비즈니스 로직은 Service로 위임한다.
- DTO를 통해 입력/출력 스키마를 명시한다.
- 도메인 경계는 `src/<domain>` 단위로 유지한다.

## Shared Conventions

- 서버 alias는 `@/* -> ./src/*`를 사용한다.
- 테스트는 Jest + `*.spec.ts` 규약을 사용한다.
- 배포 산출물(`dist/`)은 편집 대상이 아니다.
- Prisma 마이그레이션/클라이언트 생성은 패키지 스크립트를 통해서만 수행한다.

## Where To Look

| Task                | Location                                                          | Notes                      |
| ------------------- | ----------------------------------------------------------------- | -------------------------- |
| App bootstrap       | `missionary-server/src/main.ts`                                   | CORS, global pipes/filters |
| Module graph        | `missionary-server/src/app.module.ts`                             | 도메인 모듈 연결           |
| DB schema/migration | `missionary-server/prisma`                                        | schema + migration         |
| Test config         | `missionary-server/jest.config.ts`                                | `.spec.ts` 규칙            |
| Build/runtime       | `missionary-server/tsconfig.json`, `missionary-server/Dockerfile` | `dist/main` 실행           |

## Anti-Patterns

- Service 로직을 Controller에 직접 넣지 않는다.
- DTO 검증/글로벌 ValidationPipe를 우회하지 않는다.
- Prisma schema와 애플리케이션 타입을 임의로 불일치 상태로 두지 않는다.
- 생성물(`dist/`)과 배포 파일을 애플리케이션 소스처럼 수정하지 않는다.

## Commands

```bash
pnpm --filter missionary-server dev
pnpm --filter missionary-server test
pnpm --filter missionary-server build
pnpm --filter missionary-server prisma:generate
pnpm --filter missionary-server prisma:migrate:dev
pnpm --filter missionary-server prisma:migrate:deploy
```
