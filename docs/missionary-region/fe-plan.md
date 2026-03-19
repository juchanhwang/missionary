# FE 테크 스펙 및 개발 플랜: 연계지 관리 페이지

| 항목 | 내용 |
|------|------|
| 문서 버전 | v1.0 |
| 작성일 | 2026-03-19 |
| 참조 PRD | `./prd.md` (v0.7) |
| 참조 UI 명세 | `./ui-spec.md` (v1.7) |
| 대상 패키지 | `packages/client/missionary-admin` |

---

## 1. 기존 프로젝트 패턴 분석

### 1-1. 디렉토리 구조 (라우트 코로케이션)

기존 `users` 페이지 패턴을 기준으로 분석한다.

```
app/(admin)/users/
├── page.tsx                    # 서버 컴포넌트 (초기 데이터 페칭)
├── layout.tsx                  # 레이아웃
├── _components/
│   ├── UsersPageClient.tsx     # 메인 클라이언트 컨테이너
│   ├── UserSearchFilter.tsx    # 필터 행
│   ├── UserTable.tsx           # 테이블
│   └── panel/                  # 패널 관련 (수정/삭제)
├── _hooks/
│   ├── useGetUsers.ts          # 목록 조회 (useQuery)
│   ├── useGetUser.ts           # 상세 조회
│   ├── useUpdateUserAction.ts  # 수정 (useMutation)
│   └── useDeleteUserAction.ts  # 삭제 (useMutation)
├── _schemas/
│   └── userSchema.ts           # Zod 검증 스키마
└── _utils/
    ├── formatDate.ts
    └── maskIdentityNumber.ts
```

### 1-2. 상태 관리 패턴

| 관심사 | 현재 패턴 | 연계지 적용 |
|--------|----------|-------------|
| 서버 상태 | TanStack Query (`useQuery`, `useMutation`) | 동일 |
| 필터 상태 | `useState` (Users — URL 미반영) | **URL 쿼리 파라미터** (PRD 요구사항) |
| 폼 상태 | React Hook Form + Zod + `zodResolver` | 동일 |
| 인증/권한 | `useAuth()` → `user.role` 체크 | 동일 |
| 모달 제어 | `react-modal` + `overlay.openAsync` (DS) | 동일 |

> **핵심 차이**: Users 페이지는 필터를 `useState`로 관리하지만, 연계지 페이지는 **URL 쿼리 파라미터**(`?missionGroupId=&missionaryId=&query=&page=`)로 관리하여 새로고침 유지 및 링크 공유를 지원한다. 페이지네이션도 URL `page` 파라미터로 관리한다.

### 1-3. API 연동 패턴

```typescript
// API 모듈: src/apis/*.ts
// - axios 인스턴스 사용 (src/apis/instance.ts)
// - 401 자동 리프레시 인터셉터 내장
// - 객체 리터럴 패턴 (export const xxxApi = { ... })

// Query Keys: src/lib/queryKeys.ts
// - 계층형 키 팩토리 패턴 (all → list → detail)

// Hook: app/**/_hooks/useXxx.ts
// - 조회: useQuery + queryKeys.xxx.list(params)
// - 변이: useMutation + queryClient.invalidateQueries
```

### 1-4. DS 컴포넌트 사용 패턴

| DS 컴포넌트 | 용례 | 참조 파일 |
|-------------|------|-----------|
| `Select` | 필터 드롭다운, 폼 셀렉트 | `UserSearchFilter.tsx`, `UserForm.tsx` |
| `SearchBox` | 검색 입력 (debounce 직접 구현) | `UserSearchFilter.tsx` |
| `InputField` | 텍스트/이메일/전화 입력 | `UserForm.tsx` |
| `Button` | 액션 버튼 | `DeleteUserModal.tsx` |
| `overlay` | 비동기 모달 (openAsync → close → unmount) | `UserEditPanel.tsx` |

### 1-5. 기존 재사용 가능 자원

| 자원 | 위치 | 비고 |
|------|------|------|
| `missionGroupApi.getMissionGroups()` | `src/apis/missionGroup.ts` | 선교 그룹 목록 — 이미 존재 |
| `missionaryApi.getMissionaries()` | `src/apis/missionary.ts` | 선교(차수) 목록 — 이미 존재 |
| `MissionGroup` 타입 | `src/apis/missionGroup.ts` | `category: 'DOMESTIC' \| 'ABROAD'` 포함 |
| `Missionary` 타입 | `src/apis/missionary.ts` | `missionGroupId`, `missionGroup` 포함 |
| `useGetMissionaries` 훅 | `src/hooks/missionary/useGetMissionaries.ts` | 전체 선교 목록 조회 |
| `useGetMissionGroups` 훅 | `src/app/(admin)/missions/_hooks/useGetMissionGroups.ts` | 선교 그룹 목록 조회 |
| `queryKeys` | `src/lib/queryKeys.ts` | `missionaries`, `missionGroups` 키 존재 |
| `stripEmpty` | `src/apis/utils.ts` | 빈 값 필터링 유틸 |
| `UnsavedChangesModal` | `src/app/(admin)/users/_components/panel/` | 이탈 방지 모달 패턴 |
| 사이드바 `/regions` | `src/components/sidebar/Sidebar.tsx:38` | 네비게이션 이미 등록 |

---

## 2. 컴포넌트 설계

### 2-1. 파일 구조

```
app/(admin)/regions/
├── page.tsx                                  # 서버 컴포넌트 (searchParams 파싱)
├── _components/
│   ├── MissionaryRegionsPageClient.tsx       # 메인 클라이언트 컨테이너
│   ├── MissionaryRegionFilters.tsx           # 필터 행 (SearchBox + 2x Select)
│   ├── MissionGroupSelect.tsx               # 선교 그룹 드롭다운 (카테고리 라벨)
│   ├── MissionarySelect.tsx                 # 차수 드롭다운 (cascade 연동)
│   ├── MissionaryRegionTable.tsx            # 연계지 목록 테이블
│   ├── MissionaryRegionPagination.tsx      # 페이지네이션 컴포넌트
│   ├── MissionaryRegionEmptyState.tsx       # 빈 상태 / 에러 상태 UI
│   └── modal/
│       ├── MissionaryRegionFormModal.tsx     # 등록/수정 모달 (mode prop)
│       ├── MissionaryRegionForm.tsx          # 폼 컴포넌트 (RHF)
│       ├── KakaoAddressButton.tsx            # 카카오 주소 검색 버튼
│       └── DeleteMissionaryRegionModal.tsx   # 삭제 확인 모달
├── _hooks/
│   ├── useRegionFilterParams.ts             # URL 쿼리 파라미터 ↔ 필터 상태 동기화
│   ├── useGetMissionGroups.ts               # 선교 그룹 목록 조회
│   ├── useGetMissionaries.ts                # 선교 목록 조회 (그룹 기준 필터)
│   ├── useGetMissionaryRegions.ts           # 연계지 목록 조회 (전체 조회 API)
│   ├── useCreateMissionaryRegion.ts         # 등록 mutation
│   ├── useUpdateMissionaryRegion.ts         # 수정 mutation
│   ├── useDeleteMissionaryRegion.ts         # 삭제 mutation
│   └── useKakaoAddress.ts                   # 카카오 주소 검색
└── _schemas/
    └── missionaryRegionSchema.ts            # Zod 검증 스키마
```

> **라우트 경로 확정**: `app/(admin)/regions/` — BE에서 regions 명칭을 사용하고 있으므로 `/regions`로 확정. 사이드바 href(`/regions`)와도 일치하여 변경 불필요.

```
app/(admin)/regions/
├── page.tsx
├── _components/
│   ├── ...위와 동일
├── _hooks/
│   ├── ...위와 동일
└── _schemas/
    └── ...위와 동일
```

### 2-2. 컴포넌트 트리

```
page.tsx (서버 컴포넌트)
└── MissionaryRegionsPageClient (클라이언트 컨테이너)
    ├── 헤더 영역
    │   ├── h1 "연계지 관리"
    │   └── Button "연계지 등록" (ADMIN 전용)
    │
    ├── MissionaryRegionFilters
    │   ├── SearchBox (flex-1, max-w-[360px])
    │   ├── MissionGroupSelect (카테고리 라벨)
    │   └── MissionarySelect (cascade 연동)
    │
    └── 테이블 카드
        ├── 카드 헤더 ("연계지 목록" + 카운트 뱃지)
        │
        ├── [로딩 시] Skeleton 행 5개
        ├── [에러 시] MissionaryRegionEmptyState type="error"
        ├── [데이터 없음] MissionaryRegionEmptyState type="empty"
        ├── [검색 결과 없음] MissionaryRegionEmptyState type="no-results"
        └── [데이터 있음] MissionaryRegionTable
            └── 행 (row) × N
                ├── 선교 그룹 | 차수 | 연계지 | 방문목적 | 목사명 | 목사연락처 | 주소 | 액션
                └── 액션 (ADMIN 전용)
                    ├── 수정 버튼 → MissionaryRegionFormModal (mode='edit')
                    └── 삭제 버튼 → DeleteMissionaryRegionModal
        │
        └── MissionaryRegionPagination (total > ITEMS_PER_PAGE 일 때 표시)
            ├── 이전/다음 버튼
            ├── 페이지 번호 버튼
            └── 현재 페이지 / 전체 페이지 표시

모달 계층 (overlay-kit 관리):
├── MissionaryRegionFormModal
│   └── MissionaryRegionForm
│       ├── MissionGroupSelect (등록: 편집 가능, 수정: disabled + Lock)
│       ├── MissionarySelect (등록: 편집 가능, 수정: disabled + Lock)
│       ├── InputField × 4 (이름, 방문목적, 목사명, 목사연락처)
│       ├── KakaoAddressButton + InputField (기본주소)
│       └── InputField (상세주소)
├── DeleteMissionaryRegionModal
└── UnsavedChangesModal (폼 dirty 시)
```

### 2-3. 주요 컴포넌트 Props 설계

```typescript
// MissionaryRegionsPageClient
// SSR 초기 데이터 페칭 적용 (결정 사항 #3)
// page.tsx에서 HydrationBoundary로 감싸므로 props 불필요
// 내부 useQuery가 서버에서 프리페치한 캐시를 자동 사용
interface MissionaryRegionsPageClientProps {}

// MissionaryRegionFilters
interface MissionaryRegionFiltersProps {
  query: string;
  missionGroupId: string;
  missionaryId: string;
  onQueryChange: (value: string) => void;
  onMissionGroupChange: (value: string) => void;
  onMissionaryChange: (value: string) => void;
}

// MissionGroupSelect (로컬 컴포넌트 — 결정 사항 #4)
// 필터 Select와 폼 Select 모두 이 컴포넌트를 사용하되,
// _components/ 내 로컬 컴포넌트로 유지. 추후 재사용 필요 시 추출.
interface MissionGroupSelectProps {
  value: string;                      // "" = 전체
  onChange: (value: string) => void;
  disabled?: boolean;                 // 수정 모달에서 true
  showLockIcon?: boolean;             // 수정 모달에서 true
}

// MissionarySelect
interface MissionarySelectProps {
  value: string;                      // "" = 전체
  missionGroupId: string;             // 선교 그룹에 따른 필터링
  onChange: (value: string) => void;
  disabled?: boolean;
  showLockIcon?: boolean;
}

// MissionaryRegionTable
// 정렬은 BE에서 처리 (결정 사항 #2) — FE는 받은 순서 그대로 렌더링
interface MissionaryRegionTableProps {
  regions: RegionListItem[];
  isLoading: boolean;
  isAdmin: boolean;
  onEdit: (region: RegionListItem) => void;
  onDelete: (region: RegionListItem) => void;
}

// MissionaryRegionEmptyState
interface MissionaryRegionEmptyStateProps {
  type: 'empty' | 'no-results' | 'error';
  query?: string;                     // type='no-results' 시 검색어 표시
  isAdmin?: boolean;                  // type='empty' 시 등록 CTA 표시
  onClearSearch?: () => void;         // type='no-results' 시 초기화
  onRetry?: () => void;              // type='error' 시 재시도
  onCreateClick?: () => void;        // type='empty' 시 등록 CTA
}

// MissionaryRegionFormModal
interface MissionaryRegionFormModalProps {
  mode: 'create' | 'edit';
  isOpen: boolean;
  close: (result: boolean) => void;
  region?: RegionListItem;            // mode='edit' 시 기존 데이터
  defaultMissionGroupId?: string;     // 필터에서 자동 채움
  defaultMissionaryId?: string;       // 필터에서 자동 채움
}

// DeleteMissionaryRegionModal
interface DeleteMissionaryRegionModalProps {
  isOpen: boolean;
  close: (result: boolean) => void;
  region: RegionListItem;             // 삭제 대상
}

// MissionaryRegionPagination
interface MissionaryRegionPaginationProps {
  currentPage: number;                // 현재 페이지 (1-based)
  totalPages: number;                 // 전체 페이지 수 (Math.ceil(total / ITEMS_PER_PAGE))
  total: number;                      // 전체 항목 수
  onPageChange: (page: number) => void;
}
```

---

## 3. 훅 설계

### 3-1. useRegionFilterParams — URL 쿼리 파라미터 동기화

```typescript
// 역할: URL searchParams ↔ 필터 상태 양방향 동기화
// 패턴: useSearchParams + router.replace
// 참고: Users 페이지와 달리 URL 기반으로 동작

const ITEMS_PER_PAGE = 20;

interface RegionFilterParams {
  query: string;
  missionGroupId: string;
  missionaryId: string;
  page: number;                                // 현재 페이지 (1-based, 기본값 1)
}

interface UseRegionFilterParamsReturn {
  params: RegionFilterParams;
  setQuery: (value: string) => void;           // debounce 포함, page 1로 리셋
  setMissionGroupId: (value: string) => void;  // cascade: missionaryId + page 리셋
  setMissionaryId: (value: string) => void;    // page 1로 리셋
  setPage: (page: number) => void;             // 페이지 변경
  clearQuery: () => void;                      // page 1로 리셋
}

// 구현 핵심:
// - 검색어 변경: 300ms debounce 후 URL 업데이트 + page=1 리셋
// - 선교 그룹 변경: missionaryId + page 함께 제거 (cascade)
// - 필터/검색 변경 시 항상 page=1로 리셋
// - router.replace 사용 (히스토리 스택 방지)
```

### 3-2. useGetMissionGroups — 선교 그룹 목록

```typescript
// 기존 hooks: src/app/(admin)/missions/_hooks/useGetMissionGroups.ts
// 전략: 동일한 API를 사용하되, 라우트 코로케이션 원칙에 따라
//       regions/_hooks/ 에 별도 훅 생성 (queryKey는 공유)
// API: GET /mission-groups
// 반환: MissionGroup[] (id, name, category 포함)
```

### 3-3. useGetMissionaries — 선교(차수) 목록

```typescript
// 기존 hooks: src/hooks/missionary/useGetMissionaries.ts
// 차이: 선교 그룹 ID 기반 필터링이 필요
// 전략 A: 전체 목록 조회 후 클라이언트 필터링 (데이터 소규모)
// 전략 B: missionGroupId 파라미터 지원하는 API 사용

// 전략 A 채택 (기존 API 그대로 활용):
// - missionaryApi.getMissionaries() → 전체 조회
// - select 옵션으로 클라이언트 필터: .filter(m => m.missionGroupId === groupId)
// - 데이터 수 수십 건 수준으로 클라이언트 필터 충분

interface UseGetMissionariesOptions {
  missionGroupId?: string;  // 선택적 클라이언트 필터
}
```

### 3-4. useGetMissionaryRegions — 연계지 목록 (신규 API)

```typescript
// API: GET /regions?missionGroupId=&missionaryId=&query=&limit=&offset=
// 반환: RegionListResponse { data: RegionListItem[], total: number }
// queryKey: queryKeys.missionaryRegions.list(params)

interface UseGetMissionaryRegionsParams {
  missionGroupId?: string;
  missionaryId?: string;
  query?: string;
  page?: number;                    // 1-based, 기본값 1
}

// 구현:
// - queryKey에 params 포함 → 필터/페이지 변경 시 자동 리페치
// - API 호출 시 page → limit/offset 변환: { limit: ITEMS_PER_PAGE, offset: (page - 1) * ITEMS_PER_PAGE }
// - enabled: 항상 true (전체 조회 기본)
// - staleTime: 적절히 설정 (예: 30초)
// - placeholderData: keepPreviousData (페이지 전환 시 이전 데이터 유지)
```

### 3-5. useCreateMissionaryRegion — 등록 mutation

```typescript
// API: POST /missionaries/:missionaryId/regions
// 성공 시: queryClient.invalidateQueries(queryKeys.missionaryRegions.all)
// Toast: "연계지가 등록되었습니다"
```

### 3-6. useUpdateMissionaryRegion — 수정 mutation

```typescript
// API: PATCH /missionaries/:missionaryId/regions/:regionId
// 성공 시: invalidateQueries
// Toast: "연계지 정보가 수정되었습니다"
// 참고: PATCH API 미구현 시 수정 버튼 disabled 처리
```

### 3-7. useDeleteMissionaryRegion — 삭제 mutation

```typescript
// API: DELETE /missionaries/:missionaryId/regions/:regionId
// 성공 시: invalidateQueries
// Toast: "연계지가 삭제되었습니다"
```

### 3-8. useKakaoAddress — 카카오 주소 검색

```typescript
// 역할: window.daum.Postcode 팝업 제어 + 폴백 처리
// 반환: { openSearch, isKakaoAvailable }
// 동작:
//   1. CDN 로드 여부 체크 (window.daum?.Postcode)
//   2. 성공: 팝업 오픈 → 주소 선택 → onSelect 콜백
//   3. 실패: isKakaoAvailable = false → readOnly 해제 (폴백)
// CDN: layout 또는 page에 <Script> 태그 추가
```

---

## 4. API 연동 스펙

### 4-1. 신규 API 모듈: `src/apis/missionaryRegion.ts`

```typescript
import api from './instance';
import { stripEmpty } from './utils';

// === 타입 정의 ===

export interface RegionListItem {
  id: string;
  name: string;
  visitPurpose: string | null;
  pastorName: string | null;
  pastorPhone: string | null;
  addressBasic: string | null;
  addressDetail: string | null;
  missionaryId: string;
  missionary: {
    id: string;
    name: string;
    missionGroup: {
      id: string;
      name: string;
    } | null;
  };
}

export interface RegionListResponse {
  data: RegionListItem[];
  total: number;
}

export interface GetRegionsParams {
  missionGroupId?: string;
  missionaryId?: string;
  query?: string;
  limit?: number;                   // 페이지 크기 (기본값: 20)
  offset?: number;                  // 오프셋 ((page - 1) * limit)
}

export interface CreateRegionPayload {
  name: string;
  visitPurpose?: string;
  pastorName?: string;
  pastorPhone?: string;
  addressBasic?: string;
  addressDetail?: string;
}

export interface UpdateRegionPayload {
  name?: string;
  visitPurpose?: string;
  pastorName?: string;
  pastorPhone?: string;
  addressBasic?: string;
  addressDetail?: string;
}

// === API ===

export const missionaryRegionApi = {
  /** 전체 조회 (신규 API) */
  getRegions(params?: GetRegionsParams) {
    return api.get<RegionListResponse>('/regions', {
      params: params ? stripEmpty(params) : undefined,
    });
  },

  /** 등록 (기존 API) */
  createRegion(missionaryId: string, data: CreateRegionPayload) {
    return api.post(`/missionaries/${missionaryId}/regions`, data);
  },

  /** 수정 (신규 API) */
  updateRegion(
    missionaryId: string,
    regionId: string,
    data: UpdateRegionPayload,
  ) {
    return api.patch(
      `/missionaries/${missionaryId}/regions/${regionId}`,
      data,
    );
  },

  /** 삭제 (기존 API) */
  deleteRegion(missionaryId: string, regionId: string) {
    return api.delete(`/missionaries/${missionaryId}/regions/${regionId}`);
  },
};
```

### 4-2. Query Keys 확장: `src/lib/queryKeys.ts`

```typescript
// 기존 키에 추가:
missionaryRegions: {
  all: ['missionaryRegions'] as const,
  list: (params?: object) =>
    [...queryKeys.missionaryRegions.all, 'list', params] as const,
},
```

### 4-3. API 의존성 매트릭스

| API | 상태 | 용도 | 비고 |
|-----|------|------|------|
| `GET /mission-groups` | **기존** | 선교 그룹 Select 옵션 | `category` 필드 포함 |
| `GET /missionaries` | **기존** | 차수 Select 옵션 | 클라이언트 필터링 |
| `GET /regions?...` | **신규 (P0)** | 연계지 목록 조회 | BE 구현 필요 |
| `POST /missionaries/:id/regions` | **기존** | 연계지 등록 | |
| `PATCH /missionaries/:id/regions/:regionId` | **신규 (P0)** | 연계지 수정 | BE 구현 필요, FE는 완성 구현 + 버튼 disabled |
| `DELETE /missionaries/:id/regions/:regionId` | **기존** | 연계지 삭제 | |

---

## 5. Zod 스키마 설계

```typescript
// _schemas/missionaryRegionSchema.ts
import { z } from 'zod';

export const missionaryRegionSchema = z.object({
  missionGroupId: z.string().min(1, '선교 그룹을 선택해주세요'),
  missionaryId: z.string().min(1, '차수를 선택해주세요'),
  name: z.string().min(1, '연계지 이름을 입력해주세요'),
  visitPurpose: z.string().optional(),
  pastorName: z.string().optional(),
  pastorPhone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d-]{7,15}$/.test(val),
      '전화번호 형식이 올바르지 않습니다 (숫자, 하이픈 7~15자)',
    )
    .transform((val) => val || undefined), // 빈 문자열 → undefined (BE @Matches 400 방지)
  addressBasic: z.string().optional(),
  addressDetail: z.string().optional(),
});

export type MissionaryRegionFormValues = z.infer<
  typeof missionaryRegionSchema
>;
```

---

## 6. 카카오 주소 검색 연동

### 6-1. CDN 로드

```tsx
// app/(admin)/regions/page.tsx 또는 layout
import Script from 'next/script';

// 페이지 내에서:
<Script
  src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
  strategy="lazyOnload"
/>
```

### 6-2. 타입 선언

```typescript
// src/types/kakao.d.ts 또는 _hooks/useKakaoAddress.ts 내부
declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: { roadAddress: string; jibunAddress: string }) => void;
      }) => { open: () => void };
    };
  }
}
```

### 6-3. 폴백 처리

- `window.daum?.Postcode` 존재 여부로 CDN 로드 성공/실패 판단
- 실패 시: `readOnly` 해제 + 안내 메시지 "주소 검색을 사용할 수 없어 직접 입력합니다"

---

## 7. 개발 단계별 플랜

### Wave 1: 기반 인프라 (병렬 실행 가능)

> 의존성 없는 독립 태스크. 모두 병렬 실행 가능.

| # | 태스크 | 산출물 | 예상 규모 |
|---|--------|--------|-----------|
| 1-1 | API 모듈 + 타입 정의 | `src/apis/missionaryRegion.ts` | S |
| 1-2 | Query Keys 확장 | `src/lib/queryKeys.ts` 수정 | XS |
| 1-3 | Zod 스키마 정의 | `_schemas/missionaryRegionSchema.ts` | S |
| 1-4 | 카카오 주소 훅 | `_hooks/useKakaoAddress.ts` + 타입 선언 | S |
| 1-5 | URL 필터 파라미터 훅 | `_hooks/useRegionFilterParams.ts` | M |

### Wave 2: 데이터 패칭 훅 (Wave 1-1, 1-2 완료 후)

> API 모듈과 queryKeys에 의존.

| # | 태스크 | 산출물 | 의존 |
|---|--------|--------|------|
| 2-1 | 선교 그룹 조회 훅 | `_hooks/useGetMissionGroups.ts` | 1-1, 1-2 |
| 2-2 | 선교(차수) 조회 훅 | `_hooks/useGetMissionaries.ts` | 1-1, 1-2 |
| 2-3 | 연계지 목록 조회 훅 | `_hooks/useGetMissionaryRegions.ts` | 1-1, 1-2 |
| 2-4 | 등록 mutation 훅 | `_hooks/useCreateMissionaryRegion.ts` | 1-1, 1-2 |
| 2-5 | 수정 mutation 훅 | `_hooks/useUpdateMissionaryRegion.ts` | 1-1, 1-2 |
| 2-6 | 삭제 mutation 훅 | `_hooks/useDeleteMissionaryRegion.ts` | 1-1, 1-2 |

> 2-1 ~ 2-6 모두 병렬 실행 가능 (동일 의존성).

### Wave 3: UI 컴포넌트 (Wave 2 완료 후, 병렬 실행 가능)

| # | 태스크 | 산출물 | 의존 |
|---|--------|--------|------|
| 3-1 | MissionGroupSelect 컴포넌트 | `_components/MissionGroupSelect.tsx` | 2-1 |
| 3-2 | MissionarySelect 컴포넌트 | `_components/MissionarySelect.tsx` | 2-2 |
| 3-3 | MissionaryRegionEmptyState | `_components/MissionaryRegionEmptyState.tsx` | 없음 |
| 3-4 | MissionaryRegionTable | `_components/MissionaryRegionTable.tsx` | 없음 |
| 3-5 | KakaoAddressButton | `_components/modal/KakaoAddressButton.tsx` | 1-4 |
| 3-6 | MissionaryRegionPagination | `_components/MissionaryRegionPagination.tsx` | 없음 |

> 3-1 ~ 3-6 모두 병렬 실행 가능.

### Wave 4: 모달 + 필터 (Wave 3 완료 후, 병렬 실행 가능)

| # | 태스크 | 산출물 | 의존 |
|---|--------|--------|------|
| 4-1 | MissionaryRegionForm | `_components/modal/MissionaryRegionForm.tsx` | 1-3, 3-1, 3-2, 3-5 |
| 4-2 | MissionaryRegionFormModal | `_components/modal/MissionaryRegionFormModal.tsx` | 4-1 |
| 4-3 | DeleteMissionaryRegionModal | `_components/modal/DeleteMissionaryRegionModal.tsx` | 2-6 |
| 4-4 | MissionaryRegionFilters | `_components/MissionaryRegionFilters.tsx` | 1-5, 3-1, 3-2 |

> 4-1은 3-1, 3-2, 3-5에 의존. 4-2는 4-1에 의존. 4-3, 4-4는 병렬 가능.

### Wave 5: 페이지 통합 (Wave 4 완료 후)

| # | 태스크 | 산출물 | 의존 |
|---|--------|--------|------|
| 5-1 | MissionaryRegionsPageClient | `_components/MissionaryRegionsPageClient.tsx` | Wave 4 전체 |
| 5-2 | page.tsx (서버 컴포넌트) | `page.tsx` + Script CDN + SSR prefetch (dehydrate) | 5-1 |

### Wave 6: 마무리 (Wave 5 완료 후)

| # | 태스크 | 산출물 | 의존 |
|---|--------|--------|------|
| 6-1 | 사이드바 href 확인/수정 | `Sidebar.tsx` — `/regions` ↔ 라우트 경로 일치 확인 | 5-2 |
| 6-2 | 통합 QA | 전체 플로우 검증 | 5-2 |

### 의존성 다이어그램

```
Wave 1 (병렬)          Wave 2 (병렬)        Wave 3 (병렬)        Wave 4            Wave 5         Wave 6
┌─────────────┐       ┌──────────┐         ┌──────────────┐    ┌──────────┐     ┌──────────┐   ┌──────┐
│ 1-1 API     │──┬──▶ │ 2-1~2-6  │──┬────▶ │ 3-1 GroupSel │──▶│ 4-1 Form │──▶  │ 5-1 Page │──▶│ 6-1  │
│ 1-2 QKeys   │──┘    │ 조회/변이│  │      │ 3-2 MisSel   │──▶│ 4-2 Modal│     │ 5-2 page │   │ 6-2  │
│ 1-3 Schema  │───────┼──────────┘  │      │ 3-3 Empty    │   │ 4-3 Del  │     └──────────┘   └──────┘
│ 1-4 Kakao   │───────┼─────────────┼────▶ │ 3-4 Table    │   │ 4-4 Filtr│
│ 1-5 Filter  │───────┼─────────────┘      │ 3-5 KakaoBtn │   └──────────┘
└─────────────┘       └──────────────┘      │ 3-6 Paginat  │
                                            └──────────────┘
```

---

## 8. 핵심 구현 상세

### 8-1. URL 필터 상태 관리 (useRegionFilterParams)

```typescript
// 핵심 로직 — Users 페이지와의 차이점
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';

const ITEMS_PER_PAGE = 20;

export function useRegionFilterParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 현재 값 읽기
  const params = {
    query: searchParams.get('query') ?? '',
    missionGroupId: searchParams.get('missionGroupId') ?? '',
    missionaryId: searchParams.get('missionaryId') ?? '',
    page: Number(searchParams.get('page')) || 1,  // 1-based, 기본값 1
  };

  // 검색어 debounce용 로컬 상태
  const [localQuery, setLocalQuery] = useState(params.query);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // URL 업데이트 헬퍼
  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const qs = next.toString();
    router.replace(qs ? `?${qs}` : '?', { scroll: false });
  };

  // 선교 그룹 변경 → 차수 + 페이지 리셋 (cascade)
  const setMissionGroupId = (value: string) => {
    updateParams({
      missionGroupId: value || null,
      missionaryId: null, // cascade reset
      page: null,         // page 1로 리셋 (기본값)
    });
  };

  const setMissionaryId = (value: string) => {
    updateParams({
      missionaryId: value || null,
      page: null,         // page 1로 리셋
    });
  };

  // 검색어 debounce
  const setQuery = (value: string) => {
    setLocalQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({
        query: value || null,
        page: null,       // page 1로 리셋
      });
    }, 300);
  };

  // 페이지 변경
  const setPage = (page: number) => {
    updateParams({ page: page > 1 ? String(page) : null }); // page=1이면 URL에서 제거
  };

  const clearQuery = () => {
    setLocalQuery('');
    updateParams({ query: null, page: null });
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { params, localQuery, setQuery, setMissionGroupId, setMissionaryId, setPage, clearQuery };
}
```

### 8-2. SSR 초기 데이터 페칭 (결정 사항 #3)

```typescript
// app/(admin)/regions/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import Script from 'next/script';
import { missionaryRegionApi } from '@/apis/missionaryRegion';
import { missionGroupApi } from '@/apis/missionGroup';
import { queryKeys } from '@/lib/queryKeys';
import { MissionaryRegionsPageClient } from './_components/MissionaryRegionsPageClient';

const ITEMS_PER_PAGE = 20;

interface PageProps {
  searchParams: Promise<{
    query?: string;
    missionGroupId?: string;
    missionaryId?: string;
    page?: string;
  }>;
}

export default async function RegionsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const page = Number(rawParams.page) || 1;
  const queryClient = new QueryClient();

  // page → limit/offset 변환
  const apiParams = {
    missionGroupId: rawParams.missionGroupId,
    missionaryId: rawParams.missionaryId,
    query: rawParams.query,
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE,
  };

  // 초기 데이터 병렬 프리페치
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.missionaryRegions.list(apiParams),
      queryFn: () => missionaryRegionApi.getRegions(apiParams),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.missionGroups.all,
      queryFn: () => missionGroupApi.getMissionGroups(),
    }),
  ]);

  return (
    <>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MissionaryRegionsPageClient />
      </HydrationBoundary>
    </>
  );
}
```

> **참고**: SSR prefetch를 적용하므로 `MissionaryRegionsPageClient`는 `dehydratedState` prop 대신 `HydrationBoundary`로 감싸는 패턴을 사용한다. 클라이언트 컴포넌트 내 `useQuery`가 서버에서 미리 채운 캐시를 자동으로 사용한다.

### 8-3. 빈 상태 분기 로직

```typescript
// MissionaryRegionsPageClient 내부:
// 빈 상태 B vs C 판단 기준:
// - query가 있고 결과 없음 → type="no-results" (빈 상태 C)
// - query가 없고 결과 없음 → type="empty" (빈 상태 B)
const emptyType = params.query ? 'no-results' : 'empty';
```

### 8-4. PATCH 임시 처리

```tsx
// MissionaryRegionTable.tsx 내 수정 버튼:
<Button
  variant="outline"
  size="sm"
  disabled={true}  // ← PATCH API 배포 후 이 한 줄만 제거
  title="현재 사용 불가 (준비 중)"
  onClick={() => onEdit(region)}
>
  수정
</Button>
```

### 8-5. 등록 모달 필터값 자동 채움

```typescript
// MissionaryRegionsPageClient에서 등록 모달 열 때:
const handleCreateClick = () => {
  overlay.openAsync(({ isOpen, close, unmount }) => (
    <MissionaryRegionFormModal
      mode="create"
      isOpen={isOpen}
      close={(result) => { close(result); setTimeout(unmount, 300); }}
      // 필터에서 특정 값이 선택되어 있으면 자동 채움
      defaultMissionGroupId={params.missionGroupId || undefined}
      defaultMissionaryId={params.missionaryId || undefined}
    />
  ));
};
```

### 8-6. 페이지네이션 구현 상세

```typescript
// _components/MissionaryRegionPagination.tsx
const ITEMS_PER_PAGE = 20;

// 전체 페이지 수 계산
const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

// 표시할 페이지 번호 계산 (최대 5개)
function getPageNumbers(current: number, total: number): number[] {
  const maxVisible = 5;
  if (total <= maxVisible) return Array.from({ length: total }, (_, i) => i + 1);

  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  const end = Math.min(total, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
```

```tsx
// 렌더링:
// total > ITEMS_PER_PAGE 일 때만 표시
{totalPages > 1 && (
  <MissionaryRegionPagination
    currentPage={params.page}
    totalPages={totalPages}
    total={data.total}
    onPageChange={setPage}
  />
)}
```

```typescript
// useGetMissionaryRegions 훅 내부 — page → limit/offset 변환:
const { page = 1, ...filterParams } = params;
const apiParams = {
  ...filterParams,
  limit: ITEMS_PER_PAGE,
  offset: (page - 1) * ITEMS_PER_PAGE,
};

// placeholderData로 페이지 전환 시 이전 데이터 유지
useQuery({
  queryKey: queryKeys.missionaryRegions.list(apiParams),
  queryFn: () => missionaryRegionApi.getRegions(apiParams),
  placeholderData: keepPreviousData,
});
```

### 8-7. 테이블 주소 truncate + tooltip

```tsx
// 주소 셀:
<td className="px-5 py-3.5 text-sm text-gray-500">
  <div className="truncate max-w-[200px]" title={fullAddress}>
    {region.addressBasic ?? '—'}
    {region.addressDetail && (
      <>
        <br />
        <span className="text-gray-400">{region.addressDetail}</span>
      </>
    )}
  </div>
</td>
```

---

## 9. 의존성 및 리스크

### 9-1. BE 의존성 (블로커)

| 의존성 | 우선순위 | 영향 | 완화 전략 |
|--------|:--------:|------|-----------|
| `GET /regions` API | P0 | 페이지 전체 기능 블로커 | MSW 모킹으로 FE 개발 선행 가능 |
| `PATCH /regions` API | P0 | 수정 기능 블로커 | 수정 버튼 disabled 처리, 로직은 완성 구현 |
| 인가(Guard) 적용 | P0 | 비인가 접근 시 에러 | FE는 role 기반 UI 분기로 독립 |

### 9-2. FE 리스크

| 리스크 | 영향도 | 대응 |
|--------|:------:|------|
| 카카오 CDN 로드 실패 | 중 | 폴백 처리 구현 (readOnly 해제 + 안내) |
| GET /regions 응답 형태 변경 | 고 | 타입 정의를 PRD 스키마 기준으로 선 구현, 실제 API와 diff 시 조정 |
| 대량 데이터 (수백 건) 시 성능 | 저 | 페이지네이션 적용 (limit=20, offset 기반), `keepPreviousData`로 UX 개선 |
| overlay-kit 모달 중첩 (이탈 방지 모달) | 중 | UnsavedChangesModal 패턴 검증 필요 (UserEditPanel 패턴 참조) |

### 9-3. MSW 모킹 전략 (BE 미완료 시)

```typescript
// test/mocks/handlers.ts에 추가:
// GET /regions → 목 데이터 반환
// PATCH /missionaries/:id/regions/:regionId → 성공 응답
// 개발 중에는 MSW 핸들러로 작업, BE 완료 후 제거
```

### 9-4. 결정 사항 (2026-03-19 확정)

| # | 항목 | 결정 | 설계 반영 |
|---|------|------|-----------|
| 1 | 라우트 경로 | **`/regions` 확정** — BE에서 regions 명칭 사용 중이므로 일치시킴 | 디렉토리: `app/(admin)/regions/`, 사이드바 href 변경 불필요 |
| 2 | 정렬 처리 | **BE에서 처리** — 서버사이드 필터/검색이므로 BE API 응답에서 정렬(그룹 ASC → 차수 DESC → 이름 ASC) 처리 | FE는 정렬 로직 불필요, 받은 순서 그대로 렌더링 |
| 3 | 초기 데이터 페칭 | **SSR 초기 데이터 페칭 적용** — 베스트 프랙티스이므로 서버 컴포넌트에서 초기 데이터를 가져옴 | `page.tsx`에서 초기 데이터 페칭 후 `dehydrate` → 클라이언트 hydration |
| 4 | MissionGroupSelect | **로컬 컴포넌트로 작업** — 현재 다른 곳에서 재사용되고 있지 않음 | `_components/MissionGroupSelect.tsx`로 코로케이션, 추후 재사용 필요 시 추출 |

---

## 10. 기술 스택 요약

| 범주 | 기술 |
|------|------|
| 프레임워크 | Next.js App Router |
| 상태 관리 | TanStack Query (서버), URL SearchParams (필터), React Hook Form (폼) |
| 검증 | Zod + zodResolver |
| UI 컴포넌트 | @samilhero/design-system (Select, SearchBox, InputField, Button) |
| 모달 | react-modal + overlay-kit (overlay.openAsync) |
| 아이콘 | lucide-react (Building2, Search, AlertCircle, Lock, Pencil, Trash2) |
| 토스트 | sonner |
| 주소 검색 | 카카오 주소 검색 API (CDN) |
| 인증 | useAuth() (AuthContext) |
