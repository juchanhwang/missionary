# Draft: 어드민 이메일 회원가입/로그인

## 현재 상태 파악 (Research Findings)

### 어드민 앱 (missionary-admin) — 이미 구현된 것

- **로그인 페이지** (`/login`): `loginId` + `password` 기반 로그인 (이메일 아님)
- **소셜 로그인**: Google, Kakao 버튼 존재
- **인증 흐름**: Cookie 기반 JWT (access 15분, refresh 7일)
- **라우트 보호**: `proxy.ts` 미들웨어로 인증되지 않은 사용자를 `/login`으로 리디렉트
- **상태 관리**: React Query + AuthContext (useSuspenseGetMe)
- **API 클라이언트**: Axios 인스턴스 + 401 인터셉터로 자동 토큰 갱신
- **디렉토리 패턴**: `_components/`, `_hooks/`, `_schemas/` 코로케이션

### 백엔드 (missionary-server) — 관련 엔드포인트

- `POST /auth/login` — 일반 유저 이메일 로그인 (email + password)
- `POST /auth/admin/login` — 어드민 loginId 로그인 (loginId + password)
- `POST /users` — 유저 생성 (@Public, CreateUserDto)
- `GET /auth/me` — 현재 사용자 정보 (JWT 보호)
- `POST /auth/refresh` — 토큰 갱신
- `POST /auth/logout` — 로그아웃

### Prisma User 모델

- email (unique, optional), password (optional), loginId (optional)
- role: USER | ADMIN | STAFF
- provider: LOCAL | GOOGLE | KAKAO
- 별도의 Admin 모델은 없음 (User 테이블에서 role로 구분)

### 핵심 차이점

- 현재 어드민 로그인: `loginId` + `password` → `POST /auth/admin/login`
- 사용자 요청: 이메일 기반 회원가입/로그인

## Requirements (confirmed)

- (대기 중)

## Technical Decisions

- (대기 중)

## Open Questions

1. 기존 loginId 로그인을 이메일 로그인으로 **대체**하는가, **추가**하는가?
2. 회원가입 시 어떤 필드가 필요한가? (이메일, 비밀번호, 이름, ...)
3. 백엔드 변경 범위 — 새 엔드포인트 필요? 기존 수정?
4. 이메일 인증 필요 여부
5. 비밀번호 규칙 (길이, 특수문자 등)
6. 회원가입 후 자동 로그인 여부

## Scope Boundaries

- INCLUDE: (대기 중)
- EXCLUDE: (대기 중)
