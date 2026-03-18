# PRD: 연계지 관리 페이지

| 항목 | 내용 |
|------|------|
| 문서 버전 | v0.2 |
| 작성일 | 2026-03-18 |
| 작성자 | PO |
| 상태 | Review |
| UI 명세 | `/Users/JuChan/ui-spec-missionary-region.md` |

---

## 1. 문제 정의 (Problem Statement)

### 해결하려는 문제
선교(Missionary)에 연결된 연계지(연계 교회) 정보를 관리할 수 있는 시스템이 없다. 현재 연계지 데이터는 DB에 존재하지만, 이를 조회하거나 관리할 수 있는 관리 화면이 부재하여 운영 효율이 떨어진다.

### 현재 상태 (As-Is)
- 연계지 데이터는 `missionary_region` 테이블에 저장되어 있음
- 백엔드 API는 생성(POST), 조회(GET), 삭제(DELETE)만 존재하며, 수정(PATCH) API 미구현
- 관리 UI 없음 — 데이터 확인/수정이 불가능한 상태

### 목표 상태 (To-Be)
- 관리자가 연계지를 등록/조회/수정/삭제할 수 있는 관리 페이지 제공
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
| id | 고유 식별자 | number | 자동 |
| name | 연계지(교회) 이름 | string | Y |
| visitPurpose | 방문 목적 | string | N |
| pastorName | 담당 목사 이름 | string | N |
| pastorPhone | 담당 목사 연락처 | string | N |
| addressBasic | 기본 주소 | string | N |
| addressDetail | 상세 주소 | string | N |
| missionaryId | 소속 선교 ID (FK) | number | Y |

### 관계
```
Missionary (선교) ──1:N──▶ MissionaryRegion (연계지)
```

---

## 4. 기능 요구사항 (Functional Requirements)

### FR-1: 연계지 목록 조회
- **설명**: 선교별 연계지 목록을 조회한다
- **사용자**: 모든 사용자
- **기존 API**: `GET /missionaries/:id/regions`
- **표시 정보**: 이름, 방문목적, 목사명, 목사연락처, 주소
- **필터/검색**: 선교(Missionary) 선택 필터 필수

### FR-2: 연계지 등록
- **설명**: 선교에 새로운 연계지를 추가한다
- **사용자**: ADMIN만
- **기존 API**: `POST /missionaries/:id/regions`
- **입력 필드**: name(필수), visitPurpose, pastorName, pastorPhone, addressBasic, addressDetail

### FR-3: 연계지 수정
- **설명**: 기존 연계지 정보를 수정한다
- **사용자**: ADMIN만
- **기존 API**: 미구현 — 백엔드 작업 필요
- **필요 API**: `PATCH /missionaries/:id/regions/:regionId`
- **수정 가능 필드**: name, visitPurpose, pastorName, pastorPhone, addressBasic, addressDetail

### FR-4: 연계지 삭제
- **설명**: 연계지를 삭제한다
- **사용자**: ADMIN만
- **기존 API**: `DELETE /missionaries/:id/regions/:regionId`
- **삭제 전 확인**: 삭제 확인 다이얼로그 필수

---

## 5. 백엔드 작업 항목 (Backend Tasks)

| 우선순위 | 작업 | 설명 |
|:--------:|------|------|
| P0 | PATCH API 추가 | `PATCH /missionaries/:id/regions/:regionId` 엔드포인트 구현. DTO는 이미 존재. |

---

## 6. 화면 구성 (UI/UX)

> UI 상세 명세: `/Users/JuChan/ui-spec-missionary-region.md`

### 설계 결정사항

| 결정 | 내용 | 근거 |
|------|------|------|
| 등록/수정 폼 | **모달** | 필드 6개로 단순, 슬라이드 패널은 과도 |
| 선교 선택 상태 | **URL 쿼리 파라미터** (`?missionaryId=123`) | 새로고침 유지, 링크 공유 가능 |
| 등록 버튼 | 선교 미선택 시 **disabled** + tooltip | 연계지는 반드시 선교에 소속 |
| 페이지네이션 | **미적용** (MVP) | 선교당 연계지 수 수십 개 이하 예상 |
| 선교 Select "전체" 옵션 | **미적용** | 연계지는 선교 맥락 없이 나열 무의미 |
| 등록/수정 폼 재사용 | `mode` prop으로 분기 | 동일 컴포넌트로 등록/수정 처리 |

### 페이지 구성
1. **연계지 목록 화면**: 선교 선택 드롭다운 → 해당 연계지 테이블 목록 표시
2. **연계지 등록/수정 모달**: 등록 및 수정 시 모달 폼
   - 목사명 + 목사연락처는 2열 그리드 (의미 묶음)
3. **삭제 확인 다이얼로그**

### 빈 상태 (Empty States)
- **선교 미선택**: MapPin 아이콘 + "선교를 선택해주세요" 안내
- **연계지 없음**: Building2 아이콘 + ADMIN이면 등록 CTA 포함

### 엣지 케이스 처리
- **PATCH API 미구현 (임시)**: 수정 버튼 disabled + tooltip "현재 사용 불가". 수정 폼과 API 호출 로직은 미리 구현하되, BE 배포 전까지만 disabled 처리
- **이탈 방지**: 폼 dirty 상태에서 닫기 시 "저장하지 않은 변경사항이 있습니다" 확인 모달
- **긴 주소/이름**: 테이블 내 truncate + hover tooltip

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

---

## 8. 성공 지표 (Success Metrics)

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 연계지 CRUD 완료율 | 관리자가 UI에서 모든 CRUD 작업 가능 | 기능 테스트 통과 |
| 페이지 로딩 시간 | < 2초 | 프론트엔드 성능 측정 |

---

## 9. 기술 의존성 (Dependencies)

| 의존성 | 상태 | 담당 |
|--------|------|------|
| PATCH API 구현 | 미구현 | Backend |
| Missionary 목록 API | 기존재 (확인 필요) | - |
| 유저 관리 페이지 완료 | 선행 작업 | Frontend |
