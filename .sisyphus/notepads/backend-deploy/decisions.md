# Architectural Decisions — backend-deploy

## Key Decisions

(Subagents will append decisions here)

---

## COOKIE_SECURE 환경변수 도입 (2026-02-12)

- **Problem**: `NODE_ENV=production` 환경에서 `secure: true`가 강제되어, HTTP로 서빙되는 배포 환경(프록시 뒤 등)이나 로컬 테스트 시 쿠키가 설정되지 않는 문제 발생.
- **Decision**: `COOKIE_SECURE` 환경변수를 통해 쿠키의 secure 속성을 명시적으로 제어하도록 변경.
  - `.env`에 `COOKIE_SECURE=false` (기본값) 추가.
  - Production 배포 시 `COOKIE_SECURE=true`로 설정 필요.
- **Impact**: `auth.controller.ts`의 `cookieOptions` 수정.

## 멀티스테이지 Dockerfile: 3-stage 빌드 선택 (2026-02-12)

- **Problem**: pnpm 모노레포에서 서버 전용 프로덕션 이미지를 빌드할 때, `pnpm deploy --legacy`가 workspace 루트 의존성(Next.js 등)까지 포함시켜 이미지가 876MB로 비대해짐.
- **Alternatives Considered**:
  1. `pnpm deploy --legacy --prod`: 876MB (루트 workspace deps 포함)
  2. `pnpm install --prod --frozen-lockfile`: lockfile 불일치 에러
  3. **3-stage 빌드 (npm standalone)**: 471MB ✅
- **Decision**: 3-stage 빌드 채택
  - Stage 1 (builder): pnpm workspace 내에서 전체 빌드 (prisma generate + nest build)
  - Stage 2 (prod-deps): server package.json만으로 `npm install --omit=dev` (workspace 외부, standalone)
  - Stage 3 (runner): dist + prod node_modules + prisma artifacts만 복사
- **Rationale**:
  - npm의 `--omit=dev`는 workspace 컨텍스트 없이 정확히 `dependencies`만 설치
  - bcrypt 네이티브 빌드 도구(python3, make, g++)가 runner에 포함되지 않음
  - 500MB 미만 목표 달성 (471MB)
- **Trade-off**: prod-deps stage에서 npm 사용으로 버전 미세 차이 가능 (lockfile 기반이 아닌 registry resolve). 실질적 영향은 미미.
