# UI 설계 명세서: 연계지 관리 페이지

| 항목 | 내용 |
|------|------|
| 문서 버전 | v1.7 |
| 작성일 | 2026-03-19 |
| 작성자 | Designer (Black Widow) |
| 승인 | PO 협의 완료 (2026-03-19) — v1.7 확정 |
| 참조 PRD | prd.md (v0.5) |
| 참조 패턴 | missionary-admin/users 페이지 |

---

## 변경 이력

| 버전 | 변경 내용 |
|------|----------|
| v1.0 | 초안 — 모달 폼, 단일 선교 Select |
| v1.1 | 페이지네이션 제외, PATCH 임시 처리 방식 확정 |
| v1.2 | MissionGroup → Missionary 2단 드롭다운 채택 |
| v1.3 | 연계지 검색(FR-1-1), 카카오 주소 검색(FR-2/3), 등록 폼 선교 선택 추가 |
| v1.4 | **[주요 변경]** 전체 기본 조회로 전환, 서버사이드 검색/필터, 검색박스 상단 이동, 테이블 선교 그룹/선교 컬럼 추가, 빈 상태 A 제거, 에러 상태 추가 |
| v1.5 | SearchBox 왼쪽 배치(유저 관리 패턴 일치), 선교 그룹 컬럼 제거 + 선교 컬럼 = `MissionGroup명 (차수)` 통합, 최신 차수 먼저 정렬, 선교 그룹 Select 카테고리 라벨 추가 |
| v1.6 | **[최종 확정]** PO 결정: 선교 그룹 컬럼 복원 + 선교 컬럼 = `MissionGroup명 (차수)` 통합 표기, 정렬 규칙 3단계 확정(선교 그룹 ASC → 차수 DESC → 이름 ASC) |
| v1.7 | **[컬럼 구조 변경]** 선교 컬럼 → 차수 컬럼 (차수만 표시, 통합 표기 제거), 이름 컬럼 → 연계지 컬럼 (컬럼명 변경) |

---

## 도메인 계층 구조 (참고)

```
Category (DOMESTIC/ABROAD) — MissionGroup의 enum 필드
  └── MissionGroup (선교 그룹) — 예: "장흥선교", "필리핀선교", "군선교"
       └── Missionary (선교) — 예: "1차", "2차" (차수)
            └── MissionaryRegion (연계지) — 예: OO교회, XX교회
```

> **주의**: "국내선교/해외선교"는 MissionGroup명이 아니라 `category` enum 값이다.
> MissionGroup.name은 실제 선교 프로그램명 (장흥선교, 필리핀선교 등)이다.

---

## 1. 설계 결정 (Design Decisions)

### [v1.4 변경] 조회 방식: 전체 기본 노출로 전환

**결정**: 선교 필수 선택 제거 → **전체 연계지 기본 노출**, 필터는 선택적

**근거**: 사용자가 "특정 선교를 모른 채 연계지를 찾고 싶은" 시나리오 존재. 기존 `GET /missionaries/:id/regions` API는 선교 ID 필수이므로 전체 조회를 위해 새 API(`GET /regions?missionGroupId=&missionaryId=&query=`) 도입.

---

### [v1.5 변경] 검색박스 배치: 왼쪽으로 이동

**결정**: SearchBox를 필터 행 **맨 왼쪽**에 배치 → cascade 필터(선교 그룹 → 선교)는 오른쪽

| 이전 (v1.4) | 현재 (v1.5) |
|------------|------------|
| `[선교 그룹 ▼] [선교 ▼] [🔍 검색 flex-1]` | `[🔍 검색 flex-1] [선교 그룹 ▼] [선교 ▼]` |

**근거**: 유저 관리(`UserSearchFilter.tsx`) 패턴과 일치 — Admin 내 일관성. 검색("무엇을 찾나") → 필터("어느 범위에서") 자연스러운 좌→우 읽기 흐름.

---

### [v1.4 변경] 검색/필터: 서버사이드 통합, 상단 배치

**결정**: 검색박스 + 2단 Select 필터를 **상단 한 행에 통합**, 서버사이드 처리

| 이전 (v1.3) | 현재 (v1.5) |
|------------|------------|
| 클라이언트 사이드 필터링 (선택된 선교 내) | 서버사이드 검색/필터 (전체 범위) |
| 검색박스 — 테이블 카드 헤더 | 검색박스 — 상단 필터 행 (맨 왼쪽) |
| 선교 미선택 시 데이터 없음 | 전체 기본 로드, 필터 선택적 |

**searchQuery URL 포함**: 서버사이드이므로 `?query=` 파라미터로 URL에 반영 (새로고침 유지, 링크 공유 가능)

---

### [v1.7 변경] 테이블 컬럼 구조

**결정**: 선교 컬럼 → **차수 컬럼** (차수만 표시), 이름 컬럼 → **연계지 컬럼** (컬럼명 변경)

| 버전 | 선교 그룹 컬럼 | 선교/차수 컬럼 | 이름/연계지 컬럼 |
|------|--------------|-------------|----------------|
| v1.4 | `장흥선교` | `2차` (차수만) | `이름` |
| v1.5 | 없음 (제거) | `장흥선교 (2차)` | `이름` |
| v1.6 | `장흥선교` | `장흥선교 (2차)` | `이름` |
| **v1.7** | **`장흥선교`** | **`2차`** (차수만) | **`연계지`** |

**근거**: 선교 그룹 컬럼에 이미 `MissionGroup.name`이 표시되므로, 선교 컬럼에서 그룹명을 중복 표시할 필요가 없음. 차수만 표시하여 시각적 중복 제거. 연계지 컬럼명은 도메인 용어와 일치시킴.

---

### [v1.6 확정] 정렬: 3단계 기본 정렬

**결정**: 선교 그룹 ASC → 차수 DESC → 연계지 이름 ASC

```
1순위: 선교 그룹명 오름차순 (그룹 단위 묶음)
2순위: Missionary 차수 내림차순 (최신 차수 먼저)
3순위: 연계지 이름 오름차순
```

**예시 결과**:
```
군선교    | 1차 | AA교회
장흥선교  | 2차 | OO교회  ← 최신 차수 먼저
장흥선교  | 2차 | XX교회
장흥선교  | 1차 | OO교회  ← 이전 차수
필리핀선교 | 1차 | BB교회
```

**근거**: 운영상 최신 차수가 가장 중요. 그룹 단위 묶음으로 스캔하기 쉬움.

---

### [v1.5 신규] 선교 그룹 Select 카테고리 라벨

**결정**: 선교 그룹 Select 옵션 및 Trigger에 `(국내)/(해외)` 소형 라벨 표시

```
선교 그룹 Select 드롭다운:
  ○ 전체
  ○ 장흥선교  (국내)  ← gray-400 소형 텍스트
  ○ 군선교    (국내)
  ○ 필리핀선교 (해외)

선택 후 Trigger: 장흥선교 (국내)
```

**구현**: DS `Select.Option` children에 JSX로 카테고리 텍스트 추가 (grouped options API 없음, 이 방식이 구현 비용 최소 + 접근성 안전)

---

### [v1.2 유지] 등록/수정 폼: 모달 채택

**결정**: 모달 (슬라이드 패널 아님)
근거: 총 필드 수 8개(선교 그룹/선교 포함)로 단순, 슬라이드 패널은 필드 10+일 때 유리

---

### [v1.3 유지] 수정 모달의 선교 그룹/선교: 읽기 전용 처리

**결정**: `disabled` Select + `Lock` 아이콘 + tooltip "소속 선교 변경은 지원하지 않습니다"

---

## 2. 파일 구조

```
app/(admin)/missionary-regions/
├── page.tsx                                  # 서버 컴포넌트 (URL 파라미터 파싱, 초기 데이터)
├── _components/
│   ├── MissionaryRegionsPageClient.tsx       # 메인 클라이언트 컨테이너
│   ├── MissionaryRegionFilters.tsx           # 필터 행 (검색박스 + 선교 그룹 + 선교)
│   ├── MissionaryGroupSelect.tsx             # 선교 그룹 드롭다운 (전체 + 카테고리 라벨)
│   ├── MissionarySelect.tsx                  # 선교 드롭다운 (전체 + MissionGroup 기준 필터)
│   ├── MissionaryRegionTable.tsx             # 연계지 목록 테이블 (선교 컬럼 통합)
│   ├── MissionaryRegionEmptyState.tsx        # 빈 상태 UI (B, C, 에러)
│   └── modal/
│       ├── MissionaryRegionFormModal.tsx     # 등록/수정 모달
│       ├── MissionaryRegionForm.tsx          # 폼 컴포넌트
│       ├── KakaoAddressButton.tsx            # 카카오 주소 검색 버튼
│       └── DeleteMissionaryRegionModal.tsx   # 삭제 확인 모달
├── _hooks/
│   ├── useGetMissionGroups.ts                # 선교 그룹 목록 조회
│   ├── useGetMissionaries.ts                 # 선교 목록 조회 (선교 그룹 기준)
│   ├── useGetMissionaryRegions.ts            # 연계지 목록 조회 (전체 조회 API)
│   ├── useKakaoAddress.ts                    # 카카오 주소 검색
│   ├── useCreateMissionaryRegion.ts          # 등록
│   ├── useUpdateMissionaryRegion.ts          # 수정
│   └── useDeleteMissionaryRegion.ts          # 삭제
└── _schemas/
    └── missionaryRegionSchema.ts             # Zod 검증 스키마
```

> **[v1.4 제거]** `useFilteredRegions.ts` — 서버사이드 필터링으로 전환하여 불필요

---

## 3. 화면별 상세 설계

### 3-1. 메인 페이지

```
┌──────────────────────────────────────────────────────────────────────┐
│  연계지 관리                                    [+ 연계지 등록]       │  ← 항상 활성
├──────────────────────────────────────────────────────────────────────┤
│  검색                          선교 그룹          선교                │
│  [🔍 이름, 목사명으로 검색... ]  [전체 ▼]          [전체 ▼]          │  ← 검색 왼쪽
├──────────────────────────────────────────────────────────────────────┤
│ ← 데이터 없음 시: 빈 상태 B                                          │
│ ← 연계지 있음 시: 테이블                                             │
│ ← 검색/필터 결과 없음: 빈 상태 C                                     │
│ ← 로드 에러 시: 에러 상태                                            │
└──────────────────────────────────────────────────────────────────────┘
```

**헤더**
- 좌: 페이지 제목 "연계지 관리" (h1)
- 우: `[+ 연계지 등록]` 버튼 (ADMIN 전용, **항상 활성**)

**필터 행 (상단 통합) [v1.5 최종]**

```
검색 (flex-1, max-w)          선교 그룹              선교
[🔍 이름, 목사명으로 검색... ]  [전체 ▼]              [전체 ▼]
```

| 컨트롤 | 레이블 | 기본값 | 비고 |
|--------|--------|--------|------|
| SearchBox | — | "" | URL: `query`, debounce 300ms, placeholder: "이름, 목사명으로 검색...", `flex-1` `max-w-[360px]` |
| 선교 그룹 Select | "선교 그룹" | "전체" | URL: `missionGroupId`, 옵션에 `(국내)/(해외)` 카테고리 라벨 표시 |
| 선교 Select | "선교" | "전체" | URL: `missionaryId`, 선교 그룹 선택 시 해당 그룹 소속 선교만 표시 |

**필터 연동 규칙**:
- 선교 그룹 변경 시 → 선교 Select 리셋 ("전체"로 복귀)
- 모든 필터/검색 변경 시 → 서버 API 재호출

---

### 3-2. 상태별 콘텐츠

#### ~~빈 상태 A~~ — [v1.4 제거]
전체 기본 노출 방식으로 전환되어 "선교 미선택" 상태 자체가 없어짐

#### 빈 상태 B — 연계지 없음 (필터 적용 포함)

```
              [Building2 아이콘]
         등록된 연계지가 없습니다
     연결된 연계지가 아직 없습니다.

           [+ 연계지 등록] (ADMIN 전용 CTA)
```

> 전체 보기 시 데이터가 하나도 없거나, 필터 선택 후 해당 범위에 데이터가 없는 경우 모두 해당

#### 빈 상태 C — 검색 결과 없음

```
              [Search 아이콘]
         검색 결과가 없습니다
  '검색어'에 해당하는 연계지를 찾을 수 없습니다.

                [검색어 초기화]
```

- 아이콘: `Search` (lucide-react), 48px
- 본문: `'${query}'에 해당하는 연계지를 찾을 수 없습니다.`
- CTA: `[검색어 초기화]` — query 파라미터 제거 후 전체 목록 복귀

#### 에러 상태 [v1.4 신규]

```
              [AlertCircle 아이콘]
         데이터를 불러오지 못했습니다
     네트워크 오류가 발생했습니다. 다시 시도해주세요.

                [다시 시도]
```

- 아이콘: `AlertCircle` (lucide-react), 48px, `color: error-60`
- CTA: `[다시 시도]` — React Query `refetch()` 호출

#### 로딩 상태

- 테이블 영역 Skeleton 행 5개

---

### 3-3. 연계지 목록 테이블 [v1.7 확정]

```
┌──────────────┬──────┬──────────┬──────────┬────────┬──────────┬──────┬────────┐
│   선교 그룹   │  차수 │  연계지  │ 방문목적 │ 목사명 │ 목사연락처│ 주소 │  액션  │
├──────────────┼──────┼──────────┼──────────┼────────┼──────────┼──────┼────────┤
│ 장흥선교     │ 2차  │ OO교회   │ 단기선교 │ 박목사 │010-1234- │서울..│[수][삭]│
│ 장흥선교     │ 1차  │ OO교회   │ —        │ 김목사 │ —        │전남..│[수][삭]│ ← 같은 교회, 목사 다름!
│ 필리핀선교   │ 1차  │ XX교회   │ 의료선교 │ 이목사 │010-5555- │Manila│[수][삭]│
└──────────────┴──────┴──────────┴──────────┴────────┴──────────┴──────┴────────┘
```

**테이블 카드 헤더**
- 좌: 제목 "연계지 목록" + 카운트 뱃지 (전체 건수)
- 우: 없음 (검색박스 상단으로 이동)

**컬럼 명세 [v1.7 확정]**

| 컬럼 | width | 정렬 | 비고 |
|------|-------|------|------|
| 선교 그룹 | 140px | 좌 | MissionGroup.name. 없으면 `—` |
| 차수 | 100px | 좌 | **[v1.7 변경]** Missionary.name (차수). 예: `1차`, `2차`. 없으면 `—` |
| 연계지 | 140px | 좌 | **[v1.7 변경]** 기존 "이름" 컬럼명 변경 (MissionaryRegion.name) |
| 방문목적 | 120px | 좌 | 없으면 `—` |
| 목사명 | 100px | 좌 | 없으면 `—` |
| 목사연락처 | 130px | 좌 | 없으면 `—` |
| 주소 | flex | 좌 | 기본주소 + 상세주소 줄바꿈, truncate + hover tooltip |
| 액션 | 112px | 중앙 | ADMIN 전용 렌더 |

**기본 정렬 [v1.6 확정]**

- **1순위**: 선교 그룹명 오름차순 (그룹 단위 묶음)
- **2순위**: Missionary 차수 내림차순 (최신 차수 먼저)
- **3순위**: 연계지 이름 오름차순
- 사용자 수동 정렬: 미지원 (MVP)

---

### 3-4. 등록/수정 모달 [v1.4: 등록 모달 자동 채움 조건 변경]

#### 등록 모달 레이아웃

```
┌──────────────────────────────────────────────────────┐
│  연계지 등록                                    [×]  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  선교 그룹 *                선교 *                   │
│  [필터값 자동 채움 or 빈값▼]  [필터값 자동 채움 or 빈값▼] │
│                                                      │
│  ─────────────────────────────────────────────────  │
│                                                      │
│  이름 *                                              │
│  [                                              ]   │
│                                                      │
│  방문목적                                            │
│  [                                              ]   │
│                                                      │
│  목사명               목사연락처                     │
│  [                ]   [                         ]   │
│                                                      │
│  기본주소                                            │
│  [                              ] [주소 검색]       │
│                                                      │
│  상세주소                                            │
│  [                                              ]   │
│                                                      │
├──────────────────────────────────────────────────────┤
│                            [취소]    [저장]         │
└──────────────────────────────────────────────────────┘
```

**선교 그룹/선교 자동 채움 규칙**:
- 필터에서 특정 값 선택 중: 해당 값으로 자동 채움 + 편집 가능
- 필터가 "전체" 상태: 빈값으로 시작, 사용자 직접 선택 필수

**선교 그룹 Select 옵션 표시 [v1.5 신규]**:
- 각 옵션에 카테고리 라벨: `장흥선교 (국내)` / `필리핀선교 (해외)`
- Trigger 선택 후에도 동일: `장흥선교 (국내)`

#### 수정 모달 레이아웃

```
┌──────────────────────────────────────────────────────┐
│  연계지 수정                                    [×]  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  선교 그룹 🔒             선교 🔒                    │
│  [장흥선교 (국내) (변경 불가)] [1차 (변경 불가)]     │  ← disabled
│                                                      │
│  ─────────────────────────────────────────────────  │
│  (이하 등록 모달과 동일 — 기존 데이터 pre-fill)      │
│                                                      │
```

---

### 3-4-1. 폼 필드 명세

**등록 모달 전체 필드**

| 필드 | 컴포넌트 | 필수 | 기본값 | 비고 |
|------|---------|:----:|--------|------|
| 선교 그룹 | `Select` | Y | 필터값 자동 채움 (전체면 빈값) | 옵션에 카테고리 라벨, 변경 시 선교 Select 리셋 |
| 선교 | `Select` | Y | 필터값 자동 채움 (전체면 빈값) | 선교 그룹 선택 후 목록 활성화 |
| 이름 | `InputField` | Y | — | |
| 방문목적 | `InputField` | N | — | |
| 목사명 | `InputField` | N | — | |
| 목사연락처 | `InputField` | N | 전화번호 형식 (선택적) | |
| 기본주소 | `InputField` + `[주소 검색]` | N | — | `readOnly`, 카카오 팝업으로 입력 |
| 상세주소 | `InputField` | N | — | 직접 입력 |

**수정 모달 필드 차이**

| 필드 | 등록 | 수정 |
|------|------|------|
| 선교 그룹 | 편집 가능 Select (카테고리 라벨 포함) | `disabled` + Lock 아이콘 + tooltip |
| 선교 | 편집 가능 Select | `disabled` + Lock 아이콘 + tooltip |

**레이아웃 규칙**
- 선교 그룹 + 선교: `grid grid-cols-2 gap-4`
- 목사명 + 목사연락처: `grid grid-cols-2 gap-4`
- 기본주소: `flex gap-2` — `InputField (flex-1)` + `[주소 검색] Button (w-auto, variant=outline)`
- 구분선: `<hr class="border-gray-100">` — 선교 선택 영역과 연계지 정보 영역 시각 분리
- **모달 너비**: 480px

---

### 3-4-2. 카카오 주소 검색 상세

**동작 흐름**

```
[주소 검색] 버튼 클릭
  → window.daum.Postcode 팝업 오픈
  → 사용자가 주소 선택
  → 콜백: addressBasic input에 자동 입력 (도로명 주소 우선)
  → 커서 이동: 상세주소 input으로 포커스 이동
```

**기본주소 input 상태**

| 상태 | readOnly | 배경 | 안내 |
|------|:--------:|------|------|
| 기본 | O | `bg-gray-50` | placeholder: "주소 검색 버튼을 클릭하세요" |
| 카카오 입력 완료 | O | `bg-gray-50` | 선택된 주소 표시 |
| 카카오 API 실패 (폴백) | X | `bg-white` | 하단 안내: "주소 검색을 사용할 수 없어 직접 입력합니다" |

---

### 3-5. 삭제 확인 모달 (변경 없음)

```
┌─────────────────────────────────────┐
│  연계지 삭제                   [×]  │
├─────────────────────────────────────┤
│  'OO교회'을(를) 삭제하시겠습니까?  │
│  삭제한 데이터는 복구할 수 없습니다. │
├─────────────────────────────────────┤
│               [취소]    [삭제]      │
└─────────────────────────────────────┘
```

---

## 4. 상태 관리 설계

```
URL 쿼리 파라미터 (모두 URL 관리 — 새로고침 유지, 링크 공유 가능)
├── missionGroupId: string | null  — 선택된 선교 그룹 ID (null = 전체)
├── missionaryId: string | null    — 선택된 선교 ID (null = 전체, missionGroupId 변경 시 초기화)
└── query: string | null           — 검색어

서버 상태 (React Query)
├── missionGroups: MissionGroup[]           — 선교 그룹 목록 (name + category 포함)
├── missionaries: Missionary[]              — 선교 목록 (선교 그룹 기준)
└── missionaryRegions: MissionaryRegion[]   — 연계지 전체 목록 (필터/검색 파라미터 포함)
                                              응답에 missionary.name, missionary.missionGroup.name 포함
                                              기본 정렬: 최신 차수 먼저
```

---

## 5. 인터랙션 플로우

### 검색/필터 플로우

```
SearchBox 또는 Select 변경
  → URL 파라미터 업데이트 (300ms debounce — 검색어만)
  → GET /regions?missionGroupId=&missionaryId=&query= 호출
  → 로딩 중: Skeleton
  → 결과 있음: 테이블 렌더링 (최신 차수 먼저 정렬), 카운트 갱신
  → 결과 없음 (검색어 기준): 빈 상태 C
  → 결과 없음 (필터 기준): 빈 상태 B
  → 에러: 에러 상태
```

### 등록 플로우

```
[+ 연계지 등록] 클릭 (항상 활성)
  → MissionaryRegionFormModal 열림 (mode: 'create')
  → 선교 그룹: 필터에 값 있으면 자동 채움, 전체면 빈값
  → 선교: 필터에 값 있으면 자동 채움, 전체면 빈값
  → 폼 입력
    → 기본주소: [주소 검색] → 카카오 팝업 → 선택 → 자동 입력 → 상세주소로 포커스
  → [저장] 클릭
  → API: POST /missionaries/:missionaryId/regions
  → 성공: 모달 닫힘 + 목록 갱신 + Toast "연계지가 등록되었습니다"
  → 실패: 에러 Toast + 폼 유지
```

### 수정 플로우

```
행의 [수정] 클릭 (PATCH 구현 후 활성)
  → MissionaryRegionFormModal 열림 (mode: 'edit', 현재 데이터 pre-fill)
  → 선교 그룹 + 선교: disabled (읽기 전용)
  → 폼 수정 → [저장]
  → API: PATCH /missionaries/:missionaryId/regions/:regionId
  → 성공: 모달 닫힘 + 목록 갱신 + Toast "연계지 정보가 수정되었습니다"
```

### 삭제 플로우

```
행의 [삭제] 클릭
  → DeleteMissionaryRegionModal (연계지 이름 표시)
  → [삭제] 클릭 → API: DELETE /missionaries/:id/regions/:regionId
  → 성공: 닫힘 + 목록 갱신 + Toast "연계지가 삭제되었습니다"
```

### 이탈 방지 (Dirty Guard)

```
폼 dirty 상태에서 [×] 또는 [취소] 클릭
  → "저장하지 않은 변경사항이 있습니다. 나가시겠습니까?" 확인 모달
  → [나가기]: 닫힘 | [계속 편집]: 복귀
```

---

## 6. 접근성 (a11y)

- 모달: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- 필수 필드: `aria-required="true"`, 에러 시 `aria-describedby`
- [삭제]/[수정]: `aria-label="OO교회 삭제/수정"`
- 수정 모달 disabled Select: `aria-label="선교 그룹 (변경 불가)"`
- SearchBox: `aria-label="연계지 검색"`, `role="searchbox"`, `Escape`로 검색어 초기화
- 선교 그룹 Select 카테고리 라벨: 시각적 텍스트이므로 별도 aria-label 불필요 (스크린 리더가 텍스트 그대로 읽음)
- 테이블: `<caption className="sr-only">연계지 목록</caption>`, `<th scope="col">`
- 포커스 트랩: 모달 열림/닫힘 시 포커스 관리
- 키보드: `Escape` 모달 닫기

---

## 7. 엣지 케이스

| 상황 | 처리 방법 |
|------|----------|
| 전체 조회 결과 없음 | 빈 상태 B ("등록된 연계지가 없습니다") |
| 검색 결과 없음 | 빈 상태 C + [검색어 초기화] 버튼 |
| 목록 로드 실패 | 에러 상태 + [다시 시도] 버튼 |
| 카카오 API CDN 로드 실패 | readOnly 해제 + 안내 메시지로 폴백 |
| 카카오 팝업 창 닫기 (선택 안 함) | 기존 기본주소 값 유지 |
| 등록 폼 선교 그룹 변경 | 선교 Select 리셋 |
| 수정 모달 선교 변경 시도 | disabled로 클릭 불가, tooltip "소속 선교 변경은 지원하지 않습니다" |
| Missionary 목록 빈 경우 | "등록된 선교가 없습니다" disabled 옵션 표시 |
| 필터 + 검색 조합 결과 없음 | 빈 상태 C (검색어가 있으면 C, 없으면 B) |
| 등록 모달 "전체" 상태 오픈 | 선교 그룹/선교 빈값, 사용자 직접 선택 필수 |
| 이름 중복 (서버 에러) | 에러 Toast + 폼 유지 |
| 긴 이름/주소 | 테이블 내 truncate + hover tooltip |
| PATCH API 미구현 | 수정 버튼 `disabled` + tooltip "현재 사용 불가 (준비 중)" |
| MissionGroup.name 없음 | 선교 컬럼 `—` 표시 |

---

## 8. 확정 사항 (Resolved) [v1.5 최종]

| # | 질문 | 결정 |
|---|------|------|
| 1 | 페이지네이션 필요 여부? | **불필요 (MVP)** |
| 2 | 선교 Select "전체" 옵션 필요? | **필요 — 선교 그룹/선교 모두 "전체" 기본값** |
| 3 | PATCH API 임시 처리 방식 | **로직 완성 상태로 구현, 버튼만 disabled** |
| 4 | 검색 방식 | **서버사이드** (전체 범위 검색) |
| 5 | 검색 위치 | **[v1.5 확정] 상단 필터 행 맨 왼쪽** (유저 관리 패턴 일치) |
| 6 | 카카오 기본주소 input 방식 | **readOnly + [주소 검색] 버튼, 폴백 시 편집 허용** |
| 7 | 수정 모달 선교 그룹/선교 | **disabled + Lock 아이콘 + tooltip** |
| 8 | 검색어 URL 저장 여부 | **URL 저장** (서버사이드 전환으로 공유 가능) |
| 9 | 반응형 대응 | **데스크톱 전용 (1280px+)** |
| 10 | 선교 그룹/차수 컬럼 표시 | **[v1.7 확정]** 선교 그룹 컬럼(`MissionGroup.name`) + 차수 컬럼(`Missionary.name`, 차수만 표시) + 연계지 컬럼(기존 이름 컬럼 리네임) |
| 11 | 에러 상태 UI | **추가** — AlertCircle 아이콘 + [다시 시도] |
| 12 | 선교 그룹 카테고리 표시 | **[v1.5 신규]** Select 옵션에 `(국내)/(해외)` 소형 라벨 추가 |
| 13 | 기본 정렬 | **[v1.6 확정]** 선교 그룹 ASC → 차수 DESC → 이름 ASC (3단계 복합 정렬) |

---

## 9. 개발 구현 가이드

### PATCH 임시 처리

```tsx
// PATCH API 배포 후 disabled={true} 한 줄만 제거
<Button variant="outline" size="sm" disabled={true} title="현재 사용 불가 (준비 중)"
  onClick={() => openEditModal(region)}>
  수정
</Button>
```

### 선교 그룹 Select — 카테고리 라벨 [v1.5 신규]

```tsx
// MissionaryGroupSelect.tsx
<Select.Options>
  <Select.Option item="">전체</Select.Option>
  {missionGroups.map((group) => (
    <Select.Option key={group.id} item={group.id}>
      <span>{group.name}</span>
      <span className="ml-1.5 text-[11px] text-gray-400">
        ({group.category === 'DOMESTIC' ? '국내' : '해외'})
      </span>
    </Select.Option>
  ))}
</Select.Options>

// Trigger에도 동일하게
<Select.Trigger>
  {selectedGroup
    ? `${selectedGroup.name} (${selectedGroup.category === 'DOMESTIC' ? '국내' : '해외'})`
    : '전체'}
</Select.Trigger>
```

### 차수 컬럼 표기 [v1.7 확정]

```tsx
// MissionaryRegionTable.tsx
// 테이블 — 선교 그룹 컬럼 + 차수 컬럼 + 연계지 컬럼 렌더
<td>{region.missionary?.missionGroup?.name ?? '—'}</td>  {/* 선교 그룹 컬럼 */}
<td>{region.missionary?.name ?? '—'}</td>                {/* 차수 컬럼 (예: "1차", "2차") */}
<td>{region.name}</td>                                   {/* 연계지 컬럼 (기존 이름 컬럼) */}
```

### 정렬 로직 [v1.6 신규]

```typescript
// BE에서 처리 (FE 재정렬 불필요)
// GET /regions 응답 기본 정렬:
// ORDER BY missionGroup.name ASC, missionary.차수 DESC, missionaryRegion.name ASC
// FE 구현 참고 (BE 미적용 시 임시):
const sorted = [...regions].sort((a, b) => {
  const groupA = a.missionary?.missionGroup?.name ?? '';
  const groupB = b.missionary?.missionGroup?.name ?? '';
  if (groupA !== groupB) return groupA.localeCompare(groupB, 'ko');
  // 차수 내림차순 (숫자 파싱)
  const numA = parseInt(a.missionary?.name ?? '0') || 0;
  const numB = parseInt(b.missionary?.name ?? '0') || 0;
  if (numA !== numB) return numB - numA;
  return (a.name ?? '').localeCompare(b.name ?? '', 'ko');
});
```

### 카카오 주소 검색 연동

```tsx
// useKakaoAddress.ts
function openKakaoSearch(onSelect: (address: string) => void) {
  if (!window.daum?.Postcode) {
    setKakaoFailed(true); // 폴백: readOnly 해제
    return;
  }
  new window.daum.Postcode({
    oncomplete: (data) => {
      onSelect(data.roadAddress || data.jibunAddress);
    },
  }).open();
}
```

```html
<!-- layout 또는 page에 CDN 추가 -->
<Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />
```

### 서버사이드 검색/필터 API 호출

```tsx
// useGetMissionaryRegions.ts
function useGetMissionaryRegions(params: {
  missionGroupId?: string;
  missionaryId?: string;
  query?: string;
}) {
  return useQuery({
    queryKey: ['missionary-regions', params],
    queryFn: () => getMissionaryRegions(params),
    // GET /regions?missionGroupId=&missionaryId=&query=
    // 응답: 최신 차수 먼저 정렬 (BE 기본 정렬)
  });
}
```

```tsx
// MissionaryRegionFilters.tsx — 검색 debounce
const [localQuery, setLocalQuery] = useState(searchParams.get('query') ?? '');
const debouncedQuery = useDebounce(localQuery, 300);

useEffect(() => {
  // debouncedQuery 변경 시 URL 파라미터 업데이트
  router.replace(createQueryString({ query: debouncedQuery || null }));
}, [debouncedQuery]);
```

### 에러 상태 처리

```tsx
// AsyncBoundary 패턴 (기존 프로젝트 패턴 활용)
<AsyncBoundary
  errorFallback={({ reset }) => (
    <MissionaryRegionEmptyState type="error" onRetry={reset} />
  )}
  loadingFallback={<MissionaryRegionSkeleton />}
>
  <MissionaryRegionTable regions={regions} />
</AsyncBoundary>
```
