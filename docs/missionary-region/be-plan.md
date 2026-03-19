# BE 테크 스펙 & 개발 플랜: 연계지 관리 API

| 항목 | 내용 |
|------|------|
| 문서 버전 | v1.0 |
| 작성일 | 2026-03-19 |
| 참조 PRD | prd.md (v0.7) |
| 참조 UI-spec | ui-spec.md (v1.7) |
| 대상 패키지 | `packages/server/missionary-server` |

---

## 1. 기존 프로젝트 패턴 분석

### 1-1. 아키텍처 패턴

```
Controller (thin) → Service (business logic) → Repository Interface → Prisma Repository (impl)
```

- **Repository 추상화**: 인터페이스(`Symbol` 토큰) + Prisma 구현체를 분리하고, Module `providers`에서 `useClass`로 바인딩
- **Soft Delete**: `PrismaService`에서 `$extends`로 전역 적용 — `delete` → `update({ deletedAt })`, 모든 `find*`에 `deletedAt: null` 자동 주입
- **DTO 검증**: `class-validator` + 전역 `ValidationPipe`(`whitelist`, `forbidNonWhitelisted`, `transform`)
- **Swagger**: `@ApiTags`, `@ApiOperation` 데코레이터 사용

### 1-2. Guard / 인가 패턴

```typescript
// app.module.ts — 전역 Guard 등록
{ provide: APP_GUARD, useExisting: JwtAuthGuard }   // 인증
{ provide: APP_GUARD, useExisting: RolesGuard }      // 인가
```

- **인증**: `JwtAuthGuard`가 전역 적용 — 모든 엔드포인트에 JWT 인증 필요 (Public 데코레이터 제외)
- **인가**: `@Roles(UserRole.ADMIN)` 데코레이터 → `RolesGuard`가 `user.role` 검사
- **GET 엔드포인트**: `@Roles` 없음 = 인증된 사용자 전체 접근 가능

> **결론**: 기존 패턴 그대로 적용하면 됨. 별도 Guard 추가 작업 없음.

### 1-3. 기존 MissionaryRegion 코드 현황

| 항목 | 상태 | 위치 |
|------|------|------|
| `CreateMissionaryRegionDto` | ✅ 존재 | `src/missionary/dto/create-missionary-region.dto.ts` |
| `UpdateMissionaryRegionDto` | ✅ 존재 (`PartialType`) | `src/missionary/dto/update-missionary-region.dto.ts` |
| `MissionaryRegionRepository` 인터페이스 | ✅ 존재 | `src/missionary/repositories/missionary-region-repository.interface.ts` |
| `PrismaMissionaryRegionRepository` | ✅ 존재 | `src/missionary/repositories/prisma-missionary-region.repository.ts` |
| `POST /missionaries/:id/regions` | ✅ 구현 | `missionary.controller.ts:68-76` |
| `GET /missionaries/:id/regions` | ✅ 구현 | `missionary.controller.ts:78-82` |
| `DELETE /missionaries/:id/regions/:regionId` | ✅ 구현 | `missionary.controller.ts:84-92` |
| `PATCH /missionaries/:id/regions/:regionId` | ❌ 미구현 | Controller/Service 메서드 없음 |
| `GET /regions` (전체 조회) | ❌ 미구현 | 별도 Controller 필요 |

### 1-4. 테스트 패턴

- **Fake Repository**: `@/testing/fakes/fake-missionary-region.repository.ts` — InMemory 구현체 사용
- **Factory**: `@/testing/factories` — `makeMissionary`, `makeMissionGroup` 등 팩토리 함수
- **테스트 이름**: 한글 행동 기반 서술 (`it('중복 이메일로 등록하면 ConflictException을 던진다')`)

---

## 2. API 설계 상세

### 2-1. `GET /regions` — 전체 연계지 목록 조회 (신규)

**설계 결정**: 기존 `MissionaryController`에 추가하지 않고, **별도 `RegionController`를 생성**한다.

- 이유: 기존 `GET /missionaries/:id/regions`는 특정 선교 기준 조회이고, `GET /regions`는 독립 리소스 조회이므로 URL prefix가 다름
- 그러나 `MissionaryModule` 내부에 두어 기존 DI 컨텍스트(Repository 등) 재활용

```
GET /regions?missionGroupId=<uuid>&missionaryId=<uuid>&query=<string>&limit=<number>&offset=<number>
```

**Query Parameters**:

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|:----:|--------|------|
| `missionGroupId` | UUID | N | — | 선교 그룹 필터 |
| `missionaryId` | UUID | N | — | 차수(선교) 필터 |
| `query` | string | N | — | name, pastorName 부분 일치 검색 |
| `limit` | number | N | — | 페이지 크기 (MVP 미사용, 예비) |
| `offset` | number | N | 0 | 오프셋 (MVP 미사용, 예비) |

**Request DTO**: `GetRegionsQueryDto`

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetRegionsQueryDto {
  @ApiPropertyOptional({ description: '선교 그룹 ID 필터' })
  @IsOptional()
  @IsUUID()
  declare missionGroupId?: string;

  @ApiPropertyOptional({ description: '차수(선교) ID 필터' })
  @IsOptional()
  @IsUUID()
  declare missionaryId?: string;

  @ApiPropertyOptional({ description: '검색어 (이름, 목사명)' })
  @IsOptional()
  @IsString()
  declare query?: string;

  @ApiPropertyOptional({ description: '페이지 크기 (예비)' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  declare limit?: number;

  @ApiPropertyOptional({ description: '오프셋 (예비)' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  declare offset?: number;
}
```

**Response Schema**:

```typescript
interface RegionListResponse {
  data: RegionListItem[];
  total: number;
}

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
    name: string;           // 차수명 (예: "2차")
    missionGroup: {
      id: string;
      name: string;         // 선교 그룹명 (예: "장흥선교")
    } | null;
  };
}
```

**정렬**: 서버에서 3단계 복합 정렬 적용

```
ORDER BY missionary.missionGroup.name ASC,
         missionary.order DESC,        -- 최신 차수 먼저
         missionaryRegion.name ASC
```

> **주의**: `missionary.name`은 "2차" 같은 문자열이므로 정렬에 `missionary.order`(정수) 사용

---

### 2-2. `PATCH /missionaries/:id/regions/:regionId` — 연계지 수정 (신규)

```
PATCH /missionaries/:missionaryId/regions/:regionId
Authorization: Bearer <JWT>
Role: ADMIN
```

**Request Body**: `UpdateMissionaryRegionDto` (이미 존재 — `PartialType(CreateMissionaryRegionDto)`)

```typescript
// 기존 DTO 그대로 사용 — pastorPhone 검증만 추가 필요
{
  name?: string;
  visitPurpose?: string;
  pastorName?: string;
  pastorPhone?: string;     // @Matches(/^[\d-]{7,15}$/) 추가
  addressBasic?: string;
  addressDetail?: string;
}
```

**Response**: 수정된 `MissionaryRegion` 객체

---

### 2-3. 기존 API Guard 적용 현황

| 엔드포인트 | 현재 Guard | 필요 Guard | 변경 |
|-----------|-----------|-----------|------|
| `POST /missionaries/:id/regions` | `@Roles(UserRole.ADMIN)` | ADMIN | ✅ 이미 적용 |
| `GET /missionaries/:id/regions` | 없음 (인증만) | 인증된 사용자 | ✅ 이미 적용 |
| `DELETE /missionaries/:id/regions/:regionId` | `@Roles(UserRole.ADMIN)` | ADMIN | ✅ 이미 적용 |
| `GET /regions` (신규) | — | 인증된 사용자 | 구현 시 `@Roles` 없이 |
| `PATCH /missionaries/:id/regions/:regionId` (신규) | — | ADMIN | `@Roles(UserRole.ADMIN)` 추가 |

> **결론**: 기존 POST/DELETE는 이미 Guard 적용 완료. 신규 엔드포인트만 패턴대로 추가.

---

## 3. DB 쿼리 설계

### 3-1. 전체 조회 쿼리 (`GET /regions`)

```typescript
// Repository 메서드: findAllWithFilters
async findAllWithFilters(params: {
  missionGroupId?: string;
  missionaryId?: string;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: RegionWithMissionary[]; total: number }> {
  const where: Prisma.MissionaryRegionWhereInput = {};

  // 차수(선교) 필터
  if (params.missionaryId) {
    where.missionaryId = params.missionaryId;
  }
  // 선교 그룹 필터 (Missionary를 경유)
  else if (params.missionGroupId) {
    where.missionary = {
      missionGroupId: params.missionGroupId,
    };
  }

  // 텍스트 검색 (name OR pastorName 부분 일치)
  if (params.query) {
    where.OR = [
      { name: { contains: params.query, mode: 'insensitive' } },
      { pastorName: { contains: params.query, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    this.prisma.missionaryRegion.findMany({
      where,
      include: {
        missionary: {
          include: {
            missionGroup: true,
          },
        },
      },
      orderBy: [
        { missionary: { missionGroup: { name: 'asc' } } },
        { missionary: { order: 'desc' } },
        { name: 'asc' },
      ],
      ...(params.limit && { take: params.limit }),
      ...(params.offset && { skip: params.offset }),
    }),
    this.prisma.missionaryRegion.count({ where }),
  ]);

  return { data, total };
}
```

**주요 포인트**:
- `missionaryId`가 있으면 직접 필터, 없고 `missionGroupId`만 있으면 `missionary.missionGroupId`로 필터
- `query` 검색은 `OR` 조건으로 `name`, `pastorName` 부분 일치 (`contains` + `insensitive`)
- 정렬은 `missionary.missionGroup.name ASC → missionary.order DESC → name ASC`
- `Promise.all`로 데이터 + count 병렬 조회
- Soft delete는 PrismaService 미들웨어가 자동 처리 (`deletedAt: null` 자동 주입)

### 3-2. 수정 쿼리 (`PATCH`)

```typescript
// Repository 메서드: update
async update(id: string, data: MissionaryRegionUpdateInput): Promise<MissionaryRegion> {
  return this.prisma.missionaryRegion.update({
    where: { id },
    data,
  });
}
```

---

## 4. pastorPhone 검증 추가

PRD v0.7에서 명시된 `pastorPhone` 형식 검증: 숫자·하이픈만 허용, 7~15자

```typescript
// create-missionary-region.dto.ts — pastorPhone 필드에 추가
@IsOptional()
@IsString()
@Matches(/^[\d-]{7,15}$/, {
  message: 'pastorPhone은 숫자와 하이픈만 허용하며 7~15자여야 합니다',
})
declare pastorPhone?: string;
```

> `UpdateMissionaryRegionDto`는 `PartialType(Create...)`이므로 자동 상속

---

## 5. 파일 변경 목록

### 신규 생성

| 파일 | 설명 |
|------|------|
| `src/missionary/dto/get-regions-query.dto.ts` | 전체 조회 Query DTO |
| `src/missionary/region.controller.ts` | `GET /regions` 전용 Controller |

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/missionary/repositories/missionary-region-repository.interface.ts` | `findAllWithFilters`, `update` 메서드 추가 + 타입 정의 |
| `src/missionary/repositories/prisma-missionary-region.repository.ts` | `findAllWithFilters`, `update` 구현 |
| `src/missionary/repositories/index.ts` | 새 타입 re-export |
| `src/missionary/missionary.service.ts` | `findAllRegions`, `updateRegion` 메서드 추가 |
| `src/missionary/missionary.controller.ts` | `PATCH :id/regions/:regionId` 엔드포인트 추가 |
| `src/missionary/missionary.module.ts` | `RegionController` 등록 |
| `src/missionary/dto/create-missionary-region.dto.ts` | `pastorPhone`에 `@Matches` 추가 |

### 테스트

| 파일 | 설명 |
|------|------|
| `src/testing/fakes/fake-missionary-region.repository.ts` | `findAllWithFilters`, `update` 메서드 추가 |
| `src/missionary/missionary.service.spec.ts` | `findAllRegions`, `updateRegion` 테스트 추가 |

---

## 6. 개발 단계별 플랜

### Wave 1: 인프라 (병렬 실행 가능)

| # | 작업 | 파일 | 의존성 |
|---|------|------|--------|
| 1-1 | `GetRegionsQueryDto` 생성 | `dto/get-regions-query.dto.ts` | 없음 |
| 1-2 | Repository 인터페이스 확장 — `findAllWithFilters`, `update` 메서드 시그니처 + 타입 추가 | `repositories/missionary-region-repository.interface.ts` | 없음 |
| 1-3 | `CreateMissionaryRegionDto`에 `pastorPhone` `@Matches` 검증 추가 | `dto/create-missionary-region.dto.ts` | 없음 |

### Wave 2: Repository 구현 (Wave 1 완료 후)

| # | 작업 | 파일 | 의존성 |
|---|------|------|--------|
| 2-1 | `PrismaMissionaryRegionRepository`에 `findAllWithFilters` 구현 (JOIN + 검색 + 정렬 + 페이지네이션). **`count` 쿼리에 `deletedAt: null` 조건 수동 추가 필수** — PrismaService `$extends`의 soft delete 필터가 `count`에는 자동 적용되지 않음 | `repositories/prisma-missionary-region.repository.ts` | 1-2 |
| 2-2 | `PrismaMissionaryRegionRepository`에 `update` 구현 | `repositories/prisma-missionary-region.repository.ts` | 1-2 |
| 2-3 | `repositories/index.ts` re-export 업데이트 | `repositories/index.ts` | 1-2 |
| 2-4 | Fake Repository에 `findAllWithFilters`, `update` 메서드 추가 | `testing/fakes/fake-missionary-region.repository.ts` | 1-2 |

### Wave 3: Service 레이어 (Wave 2 완료 후, 병렬 가능)

| # | 작업 | 파일 | 의존성 |
|---|------|------|--------|
| 3-1 | `MissionaryService.findAllRegions()` 메서드 추가 | `missionary.service.ts` | 2-1 |
| 3-2 | `MissionaryService.updateRegion()` 메서드 추가 | `missionary.service.ts` | 2-2 |

### Wave 4: Controller 레이어 (Wave 3 완료 후, 병렬 가능)

| # | 작업 | 파일 | 의존성 |
|---|------|------|--------|
| 4-1 | `RegionController` 생성 — `GET /regions` 엔드포인트 | `region.controller.ts` | 3-1, 1-1 |
| 4-2 | `MissionaryController`에 `PATCH :id/regions/:regionId` 엔드포인트 추가 | `missionary.controller.ts` | 3-2 |
| 4-3 | `MissionaryModule`에 `RegionController` 등록 | `missionary.module.ts` | 4-1 |

### Wave 5: 테스트 (Wave 4 완료 후)

| # | 작업 | 파일 | 의존성 |
|---|------|------|--------|
| 5-1 | `findAllRegions` 서비스 테스트 — 필터/검색/정렬 시나리오 | `missionary.service.spec.ts` | 3-1, 2-4 |
| 5-2 | `updateRegion` 서비스 테스트 — 정상 수정/존재하지 않는 Region | `missionary.service.spec.ts` | 3-2, 2-4 |

---

## 7. 상세 구현 가이드

### 7-1. Repository 인터페이스 확장

```typescript
// missionary-region-repository.interface.ts

// 새 타입 추가
export interface RegionWithMissionary extends MissionaryRegion {
  missionary: {
    id: string;
    name: string;
    order: number | null;
    missionGroupId: string | null;
    missionGroup: {
      id: string;
      name: string;
    } | null;
  };
}

export interface FindAllRegionsParams {
  missionGroupId?: string;
  missionaryId?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface FindAllRegionsResult {
  data: RegionWithMissionary[];
  total: number;
}

export interface MissionaryRegionUpdateInput {
  name?: string;
  visitPurpose?: string | null;
  pastorName?: string | null;
  pastorPhone?: string | null;
  addressBasic?: string | null;
  addressDetail?: string | null;
}

// 인터페이스 확장
export interface MissionaryRegionRepository {
  create(data: MissionaryRegionCreateInput): Promise<MissionaryRegion>;
  findByMissionary(missionaryId: string): Promise<MissionaryRegion[]>;
  findByIdAndMissionary(id: string, missionaryId: string): Promise<MissionaryRegion | null>;
  delete(id: string): Promise<MissionaryRegion>;
  // 신규
  findAllWithFilters(params: FindAllRegionsParams): Promise<FindAllRegionsResult>;
  update(id: string, data: MissionaryRegionUpdateInput): Promise<MissionaryRegion>;
}
```

### 7-2. RegionController

```typescript
// region.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { GetRegionsQueryDto } from './dto/get-regions-query.dto';
import { MissionaryService } from './missionary.service';

@ApiTags('Regions')
@Controller('regions')
export class RegionController {
  constructor(private readonly missionaryService: MissionaryService) {}

  @Get()
  @ApiOperation({ summary: '전체 연계지 목록 조회 (필터/검색)' })
  findAll(@Query() query: GetRegionsQueryDto) {
    return this.missionaryService.findAllRegions(query);
  }
}
```

### 7-3. MissionaryController PATCH 추가

```typescript
// missionary.controller.ts — 기존 removeRegion 메서드 위에 추가
import { UpdateMissionaryRegionDto } from './dto/update-missionary-region.dto';

@Patch(':id/regions/:regionId')
@Roles(UserRole.ADMIN)
@ApiOperation({ summary: '선교 연계지 수정 (관리자 전용)' })
updateRegion(
  @Param('id', ParseUUIDPipe) id: string,
  @Param('regionId', ParseUUIDPipe) regionId: string,
  @Body() dto: UpdateMissionaryRegionDto,
) {
  return this.missionaryService.updateRegion(id, regionId, dto);
}
```

### 7-4. MissionaryService 메서드 추가

```typescript
// missionary.service.ts

async findAllRegions(params: FindAllRegionsParams) {
  return this.missionaryRegionRepository.findAllWithFilters(params);
}

async updateRegion(
  missionaryId: string,
  regionId: string,
  dto: UpdateMissionaryRegionDto,
) {
  await this.findOne(missionaryId);

  const region = await this.missionaryRegionRepository.findByIdAndMissionary(
    regionId,
    missionaryId,
  );

  if (!region) {
    throw new NotFoundException(
      `MissionaryRegion with ID ${regionId} not found for missionary ${missionaryId}`,
    );
  }

  const data: MissionaryRegionUpdateInput = {};
  if (dto.name !== undefined) data.name = dto.name;
  if (dto.visitPurpose !== undefined) data.visitPurpose = dto.visitPurpose;
  if (dto.pastorName !== undefined) data.pastorName = dto.pastorName;
  if (dto.pastorPhone !== undefined) data.pastorPhone = dto.pastorPhone;
  if (dto.addressBasic !== undefined) data.addressBasic = dto.addressBasic;
  if (dto.addressDetail !== undefined) data.addressDetail = dto.addressDetail;

  return this.missionaryRegionRepository.update(regionId, data);
}
```

---

## 8. 테스트 전략

### 8-1. 서비스 테스트 (Fake Repository 사용)

```typescript
// missionary.service.spec.ts에 추가할 테스트 케이스

describe('findAllRegions', () => {
  it('필터 없이 호출하면 전체 연계지를 반환한다');
  it('missionGroupId로 필터링하면 해당 그룹의 연계지만 반환한다');
  it('missionaryId로 필터링하면 해당 차수의 연계지만 반환한다');
  it('query로 검색하면 이름/목사명에 매치되는 연계지만 반환한다');
  it('필터와 검색을 동시에 적용할 수 있다');
  it('total은 필터/검색 조건에 맞는 전체 건수를 반환한다');
});

describe('updateRegion', () => {
  it('존재하는 연계지를 수정하면 수정된 데이터를 반환한다');
  it('존재하지 않는 missionaryId로 수정하면 NotFoundException을 던진다');
  it('존재하지 않는 regionId로 수정하면 NotFoundException을 던진다');
  it('일부 필드만 전달하면 해당 필드만 수정된다');
});
```

### 8-2. DTO 검증 테스트

```typescript
describe('CreateMissionaryRegionDto', () => {
  it('pastorPhone이 유효한 형식이면 통과한다 (010-1234-5678)');
  it('pastorPhone이 유효하지 않은 형식이면 거부한다 (abc, 123456)');
  it('pastorPhone이 없으면 통과한다 (선택 필드)');
});
```

---

## 9. 의존성 및 리스크

| 리스크 | 영향도 | 완화 방안 |
|--------|:------:|----------|
| Prisma `orderBy` 중첩 relation 정렬 지원 여부 | 중 | Prisma 5.x+ 지원 확인 완료. 미지원 시 `$queryRaw` 또는 애플리케이션 레벨 정렬 |
| `contains` + `insensitive` 성능 (대량 데이터) | 하 | MVP 데이터 수십~수백 건 예상. 향후 인덱스 추가로 대응 |
| Soft delete 미들웨어와 `count` 쿼리 호환성 | 하 | `findMany`와 동일하게 `deletedAt: null` 자동 주입 확인 필요 — PrismaService에서 `count`에는 미적용되어 있으므로 수동 `where` 추가 필요 |
| 별도 Controller(`RegionController`) 추가 시 Module 등록 누락 | 하 | `MissionaryModule.controllers`에 추가 필수 |

### Soft Delete `count` 이슈 (주의)

현재 `PrismaService.$extends`에서 `count`에는 soft delete 필터가 적용되지 않음. `findAllWithFilters`의 `count` 쿼리에서 **명시적으로 `deletedAt: null` 조건 추가** 필요:

```typescript
this.prisma.missionaryRegion.count({
  where: { ...where, deletedAt: null },
});
```

또는 `findMany` 결과의 length를 사용하되, 페이지네이션 적용 시 별도 count가 필요하므로 명시적 조건 추가 권장.

---

## 10. 커밋 전략

| 커밋 | 포함 작업 | 메시지 |
|:----:|----------|--------|
| 1 | Wave 1 (DTO, 인터페이스, 검증) | `feat(server): 연계지 전체 조회 DTO 및 Repository 인터페이스 확장` |
| 2 | Wave 2 (Repository 구현) | `feat(server): 연계지 전체 조회/수정 Repository 구현` |
| 3 | Wave 3-4 (Service + Controller) | `feat(server): 연계지 전체 조회 API 및 수정 API 구현` |
| 4 | Wave 5 (테스트) | `test(server): 연계지 전체 조회/수정 서비스 테스트 추가` |

---

## 11. 성공 기준

```bash
# 전체 조회 API 동작 확인
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3100/regions" \
  # → { data: [...], total: N }

# 필터 + 검색
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3100/regions?missionGroupId=<uuid>&query=교회" \
  # → 해당 그룹 내 "교회" 포함 연계지만 반환

# 수정 API 동작 확인
curl -X PATCH -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "수정된교회"}' \
  "http://localhost:3100/missionaries/<missionaryId>/regions/<regionId>" \
  # → 수정된 MissionaryRegion 반환

# 테스트 통과
pnpm --filter missionary-server test
  # → All tests pass

# pastorPhone 검증
curl -X POST -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "테스트교회", "pastorPhone": "invalid"}' \
  "http://localhost:3100/missionaries/<id>/regions" \
  # → 400 Bad Request (validation error)
```
