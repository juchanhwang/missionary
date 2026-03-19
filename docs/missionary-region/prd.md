# PRD: 연계지 관리 페이지

| 항목 | 내용 |
|------|------|
| 문서 버전 | v0.6 |
| 작성일 | 2026-03-19 |
| 작성자 | PO |
| 상태 | Review |
| UI 명세 | `./ui-spec.md` |
| 대상 디바이스 | 데스크톱 전용 (1280px+) |

---

## 변경 이력

| 버전 | 변경 내용 |
|------|----------|
| v0.4 | 초안 — FR-1~4, 클라이언트 사이드 검색, 선교 필수 선택 후 조회 |
| v0.5 | 전체 기본 노출로 전환, 서버 사이드 검색/필터, 전체 조회 API 추가, 테이블 컬럼 확장(선교 그룹/선교명), 에러 상태 UI 보강, 데스크톱 전용 명시 |
| v0.6 | 용어 정비 — "선교(Missionary)" → "차수", "이름" → "연계지 이름"; 도메인 다이어그램 예시 수정(국내선교 → 장흥선교, 장흥선교 → 2차); FR-1~3 및 UI 설계 섹션 전반 반영 |

---

## 1. 문제 정의 (Problem Statement)

### 해결하려는 문제
선교(Missionary)에 연결된 연계지(연계 교회) 정보를 관리할 수 있는 시스템이 없다. 현재 연계지 데이터는 DB에 존재하지만, 이를 조회하거나 관리할 수 있는 관리 화면이 부재하여 운영 효율이 떨어진다.

### 현재 상태 (As-Is)
- 연계지 데이터는 `missionary_region` 테이블에 저장되어 있음
- 백엔드 API는 생성(POST), 개별 선교 기준 조회(GET), 삭제(DELETE)만 존재
- 수정(PATCH) API 미구현
- 전체 연계지 조회 API 미구현 — 현재는 특정 선교 ID 기준으로만 조회 가능 (`GET /missionaries/:id/regions`)
- 관리 UI 없음 — 데이터 확인/수정이 불가능한 상태

### 목표 상태 (To-Be)
- 관리자가 연계지를 등록/조회/수정/삭제할 수 있는 관리 페이지 제공
- 페이지 진입 시 **전체 연계지가 기본 노출**되어 한눈에 현황 파악 가능
- 선교 그룹/차수 필터와 텍스트 검색으로 원하는 연계지를 빠르게 찾을 수 있음
- 일반 사용자는 연계지 목록을 조회할 수 있음

---

## 2. 사용자 및 권한 (Users & Permissions)

| 역할 | 조회 | 등록 | 수정 | 삭제 |
|------|:----:|:----:|:----:|:----:|
| ADMIN (관리자) | O | O | O | O |
| 일반 사용자 | O | X | X | X |

---

## 3. 도메인 모델 (Data Model)

### MissionaryRegion (연계지)

| 필드 | 설명 | 타입 | 필수 |
|------|------|------|:----:|
| id | 고유 식별자 | string (UUID) | 자동 |
| name | 연계지(교회) 이름 | string | Y |
| visitPurpose | 방문 목적 | string | N |
| pastorName | 담당 목사 이름 | string | N |
| pastorPhone | 담당 목사 연락처 | string | N |
| addressBasic | 기본 주소 | string | N |
| addressDetail | 상세 주소 | string | N |
| missionaryId | 소속 선교 ID (FK) | string (UUID) | Y |

### 관계
```
MissionGroup (선교 그룹) ──1:N──▶ Missionary (선교) ──1:N──▶ MissionaryRegion (연계지)
예: 장흥선교(MissionGroup) → 2차(Missionary) → OO교회, XX교회(MissionaryRegion)
```

---

## 4. 기능 요구사항 (Functional Requirements)

### FR-1: 연계지 목록 조회
- **설명**: 페이지 진입 시 전체 연계지가 기본 노출된다. 선교 그룹/차수 필터로 범위를 좁힐 수 있다.
- **사용자**: 모든 사용자
- **필요 API**: `GET /regions?missionGroupId=&missionaryId=&query=` (신규)
- **표시 정보**: 선교 그룹명, 차수, 연계지 이름, 방문목적, 목사명, 목사연락처, 주소
- **필터**: MissionGroup(선교 그룹) → Missionary(차수) 계층형 필터. 둘 다 "전체"가 기본값이다.
  - 선교 그룹 선택 시: 해당 그룹 소속 차수의 연계지만 표시. 차수 드롭다운은 해당 그룹 소속 차수로 필터링.
  - 차수 선택 시: 해당 차수의 연계지만 표시.
  - 선교 그룹 변경 시: 차수 선택은 "전체"로 리셋 (cascade).
- **URL 상태**: `?missionGroupId=&missionaryId=&query=` — 필터/검색 상태를 URL 쿼리 파라미터로 유지하여 새로고침 및 링크 공유 가능.

### FR-1-1: 연계지 검색
- **설명**: 텍스트 검색으로 연계지를 필터링한다. 필터 상단에서 필터 드롭다운과 함께 배치한다.
- **사용자**: 모든 사용자
- **검색 대상**: 연계지 이름(name), 목사명(pastorName)
- **검색 방식**: 서버 사이드 검색 — 전체 조회 API의 `query` 파라미터로 처리
- **동작**: 검색어 입력 시 서버에 쿼리하여 결과 갱신. 디바운스 300ms.
- **빈 검색 결과**: "검색 결과가 없습니다" 안내 + 검색어 초기화 버튼

### FR-2: 연계지 등록
- **설명**: 선교에 새로운 연계지를 추가한다
- **사용자**: ADMIN만
- **기존 API**: `POST /missionaries/:id/regions`
- **입력 필드**:
  - 선교 그룹 선택 (MissionGroup Select) — 필터에서 특정 그룹이 선택되어 있으면 자동 채움, "전체" 상태면 빈값
  - 차수 선택 (Missionary Select) — 필터에서 특정 차수가 선택되어 있으면 자동 채움, "전체" 상태면 빈값, 선교 그룹 변경 시 리셋
  - name (필수)
  - visitPurpose
  - pastorName
  - pastorPhone
  - addressBasic — **카카오 주소 검색 API**로 입력 (팝업 → 선택 → 자동 입력)
  - addressDetail — 직접 입력
- **등록 버튼**: 항상 활성 — 차수 선택은 모달 내부에서 필수로 처리

### FR-3: 연계지 수정
- **설명**: 기존 연계지 정보를 수정한다
- **사용자**: ADMIN만
- **필요 API**: `PATCH /missionaries/:id/regions/:regionId` (신규)
- **수정 가능 필드**: name, visitPurpose, pastorName, pastorPhone, addressBasic(카카오 주소 검색), addressDetail
- **수정 폼의 선교 그룹/차수**: 읽기 전용으로 표시 (소속 차수 변경은 scope 밖)

### FR-4: 연계지 삭제
- **설명**: 연계지를 삭제한다
- **사용자**: ADMIN만
- **기존 API**: `DELETE /missionaries/:id/regions/:regionId`
- **삭제 전 확인**: 삭제 확인 다이얼로그 필수

---

## 5. 백엔드 작업 항목 (Backend Tasks)

| 우선순위 | 작업 | 설명 |
|:--------:|------|------|
| P0 | 전체 조회 API 추가 | `GET /regions?missionGroupId=&missionaryId=&query=` 엔드포인트 구현. Missionary/MissionGroup join하여 차수명/그룹명 포함 응답. `query`는 name, pastorName 부분 일치 검색. |
| P0 | PATCH API 추가 | `PATCH /missionaries/:id/regions/:regionId` 엔드포인트 구현. `UpdateMissionaryRegionDto`는 이미 존재. |

### 전체 조회 API 응답 스키마

```typescript
// GET /regions 응답 아이템
interface RegionListItem {
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
```

---

## 6. 화면 구성 (UI/UX)

> UI 상세 명세: `./ui-spec.md`

### 설계 결정사항

| 결정 | 내용 | 근거 |
|------|------|------|
| 기본 노출 | **전체 연계지 기본 노출** | 페이지 진입 즉시 현황 파악 가능, "선교 선택 필수" 허들 제거 |
| 필터 기본값 | 선교 그룹/차수 모두 **"전체"** 기본 | 전체 데이터 우선 노출 후 좁혀가는 UX |
| 검색 위치 | **필터 행 상단** (Select 옆) | 전범위 검색이므로 필터와 동일 계층. 테이블 카드 헤더 → 상단 필터 행으로 이동. |
| 검색 방식 | **서버 사이드** (API `query` 파라미터) | 전체 조회 시 N+1 호출 불가, 서버 집계 필수 |
| 등록/수정 폼 | **모달** | 필드 8개(선교그룹/차수 포함)로 단순, 슬라이드 패널은 과도 |
| 주소 입력 | **카카오 주소 검색 API** | 정확한 주소 입력 보장, 일관된 주소 형식 |
| 등록 폼 차수 선택 | 필터값 자동 채움 (특정 차수 선택 시) 또는 빈값 ("전체" 상태 시) | 편의성 + 유연성 |
| 필터 구조 | **MissionGroup(선교 그룹) → Missionary(차수) 계층형 필터** | 연계지의 상위 맥락(선교 그룹) 표시 필요 |
| 필터/검색 상태 | **URL 쿼리 파라미터** (`?missionGroupId=&missionaryId=&query=`) | 새로고침 유지, 링크 공유 가능 |
| 등록 버튼 | **항상 활성** — 차수 선택은 모달 내부에서 처리 | 전체 기본 노출에서 disabled 조건 불필요 |
| 페이지네이션 | **미적용** (MVP) | 전체 연계지 수 수십~수백 개 수준 예상 |
| 등록/수정 폼 재사용 | `mode` prop으로 분기 | 동일 컴포넌트로 등록/수정 처리 |
| 테이블 컬럼 | 선교 그룹/차수 **항상 표시** | 전체 조회 시 소속 맥락 필수, 필터 선택 시에도 유지 (조건부 렌더링 복잡도 회피) |
| 대상 디바이스 | **데스크톱 전용** (1280px+) | Admin 페이지, 기존 사이드바 구조가 모바일 미대응 |

### 페이지 구성
1. **연계지 목록 화면**: 전체 연계지 기본 표시 + 선교 그룹/차수 필터 + 검색 → 테이블 목록
2. **연계지 등록/수정 모달**: 등록 및 수정 시 모달 폼
   - 상단: 선교 그룹 + 차수 선택 (등록: 자동 채움 + 편집 가능, 수정: 읽기 전용)
   - 주소: 기본주소는 카카오 주소 검색, 상세주소는 직접 입력
   - 목사명 + 목사연락처는 2열 그리드 (의미 묶음)
3. **삭제 확인 다이얼로그**

### 빈 상태 (Empty States)
- **연계지 없음**: Building2 아이콘 + ADMIN이면 등록 CTA 포함
- **검색 결과 없음**: Search 아이콘 + 검색어 초기화 버튼

### 에러 상태 (Error States)
- **연계지 목록 로드 실패**: "데이터를 불러오지 못했습니다" + [다시 시도] 버튼
- **등록/수정/삭제 실패**: 에러 Toast

### 엣지 케이스 처리
- **PATCH API 미구현 (임시)**: 수정 버튼 disabled + tooltip "현재 사용 불가". 수정 폼과 API 호출 로직은 미리 구현하되, BE 배포 전까지만 disabled 처리. BE 배포 후 `disabled` 한 줄만 제거.
- **이탈 방지**: 폼 dirty 상태에서 닫기 시 "저장하지 않은 변경사항이 있습니다" 확인 모달
- **긴 주소/이름**: 테이블 내 truncate + hover tooltip
- **카카오 주소 검색 팝업 실패**: 네트워크 오류 시 기본 텍스트 input으로 폴백하여 수동 입력 가능
- **등록 폼 차수 변경**: 선교 그룹 변경 시 차수 Select 리셋 (필터와 동일한 cascade 동작)
- **필터 "전체" 상태에서 등록**: 모달 내에서 선교 그룹/차수 직접 선택 필수

### 기술 스택
- Next.js App Router
- React Hook Form + Zod (폼 검증)
- overlay-kit (모달 관리)
- @samilhero/design-system (디자인 시스템)

---

## 7. Scope 밖 (Out of Scope)

| 항목 | 사유 |
|------|------|
| 팀원 ↔ 연계지 배치 기능 | MVP 이후 별도 작업으로 진행 |
| Church와 MissionaryRegion 통합 | 장기 과제, 현재 구조 유지 |
| MissionaryRegion ↔ Team 관계 테이블 | 팀은 선교 차수에 따라 변동되는 값이므로 현 시점에서 불필요 |
| 모바일/태블릿 반응형 | Admin은 데스크톱 전용, 기존 사이드바 레이아웃이 모바일 미대응 |

---

## 8. 성공 지표 (Success Metrics)

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 연계지 CRUD 완료율 | 관리자가 UI에서 모든 CRUD 작업 가능 | 기능 테스트 통과 |
| 페이지 초기 로딩 시간 | < 2초 (전체 연계지 로드 포함) | 프론트엔드 성능 측정 |
| 검색 응답 시간 | < 500ms | API 응답 시간 측정 |

---

## 9. 기술 의존성 (Dependencies)

| 의존성 | 상태 | 담당 | 우선순위 |
|--------|------|------|:--------:|
| 전체 조회 API 구현 | **미구현** | Backend | P0 |
| PATCH API 구현 | **미구현** | Backend | P0 |
| MissionGroup 목록 API | 기존재 | - | - |
| Missionary 목록 API | 기존재 | - | - |
| 카카오 주소 검색 API 연동 | 신규 | Frontend | P1 |
