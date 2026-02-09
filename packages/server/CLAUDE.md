# Server (Backend) CLAUDE.md

> **Global Rules**: Root `CLAUDE.md`의 Code Quality Rules와 Commit Convention을 따른다.

## Technology Stack

- NestJS 11
- Prisma ORM + PostgreSQL
- TypeScript 5.9 (`moduleResolution: "node"`, CommonJS)

## Path Aliases

`@/*` → `./src/*` (local, 서버 전용)

## NestJS Server Pattern

`missionary-server`는 NestJS의 Module/Controller/Service 패턴을 따른다.

**디렉토리 구조 (도메인별 분류):**

```
src/
├── main.ts                     # 엔트리포인트
├── app.module.ts               # 루트 모듈
├── app.controller.ts           # health check 등 루트 엔드포인트
├── app.service.ts
└── <domain>/                   # 도메인별 디렉토리
    ├── <domain>.module.ts
    ├── <domain>.controller.ts
    ├── <domain>.service.ts
    ├── dto/                    # Request/Response DTO
    │   ├── create-<domain>.dto.ts
    │   └── update-<domain>.dto.ts
    └── entities/               # 엔티티 (DB 연동 시)
        └── <domain>.entity.ts
```

**파일 네이밍:** `<도메인>.<역할>.ts` — 예: `user.controller.ts`, `user.service.ts`, `user.module.ts`

**핵심 규칙:**

- 하나의 Module이 하나의 도메인을 담당한다 (응집도 원칙)
- Controller는 요청/응답 처리만, 비즈니스 로직은 Service에 위임한다
- Service 간 의존은 Module의 `imports`/`exports`를 통해 명시적으로 관리한다
- DTO로 요청/응답 형태를 명시하여 예측 가능성을 확보한다

## Database (Prisma)

```bash
pnpm --filter missionary-server prisma:generate        # Prisma Client 생성
pnpm --filter missionary-server prisma:migrate:dev      # 마이그레이션 생성/적용 (개발)
pnpm --filter missionary-server prisma:migrate:deploy   # 마이그레이션 적용 (프로덕션)
pnpm --filter missionary-server prisma:studio           # Prisma Studio GUI
pnpm --filter missionary-server db:push                 # 스키마 직접 반영 (프로토타이핑)
pnpm --filter missionary-server db:reset                # DB 초기화
```
