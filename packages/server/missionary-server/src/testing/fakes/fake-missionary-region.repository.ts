import { randomUUID } from 'crypto';

import type {
  FindAllRegionsParams,
  FindAllRegionsResult,
  MissionaryRegionCreateInput,
  MissionaryRegionRepository,
  MissionaryRegionUpdateInput,
  RegionWithMissionGroup,
} from '@/missionary/repositories/missionary-region-repository.interface';

import type { MissionaryRegion } from '../../../prisma/generated/prisma';

interface MissionGroupInfo {
  id: string;
  name: string;
}

export class FakeMissionaryRegionRepository implements MissionaryRegionRepository {
  private store = new Map<string, MissionaryRegion>();
  private missionGroupMap = new Map<string, MissionGroupInfo>();

  async create(data: MissionaryRegionCreateInput): Promise<MissionaryRegion> {
    const now = new Date();
    const entity: MissionaryRegion = {
      id: data.id ?? randomUUID(),
      missionGroupId: data.missionGroupId,
      name: data.name,
      visitPurpose: data.visitPurpose ?? null,
      pastorName: data.pastorName ?? null,
      pastorPhone: data.pastorPhone ?? null,
      addressBasic: data.addressBasic ?? null,
      addressDetail: data.addressDetail ?? null,
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      updatedBy: null,
      version: 0,
      deletedAt: null,
    };

    this.store.set(entity.id, entity);
    return entity;
  }

  async findByMissionGroup(
    missionGroupId: string,
  ): Promise<MissionaryRegion[]> {
    return [...this.store.values()]
      .filter((r) => r.missionGroupId === missionGroupId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByIdAndMissionGroup(
    id: string,
    missionGroupId: string,
  ): Promise<MissionaryRegion | null> {
    const entity = this.store.get(id);
    if (!entity || entity.missionGroupId !== missionGroupId) return null;
    return entity;
  }

  async delete(id: string): Promise<MissionaryRegion> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`MissionaryRegion not found: ${id}`);
    }
    this.store.delete(id);
    return existing;
  }

  async findAllWithFilters(
    params: FindAllRegionsParams,
  ): Promise<FindAllRegionsResult> {
    let regions = [...this.store.values()];

    // 필터 적용
    if (params.missionGroupId) {
      regions = regions.filter(
        (r) => r.missionGroupId === params.missionGroupId,
      );
    }

    // 검색 적용
    if (params.query) {
      const q = params.query.toLowerCase();
      regions = regions.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.pastorName && r.pastorName.toLowerCase().includes(q)),
      );
    }

    const total = regions.length;

    // 정렬: missionGroup.name ASC → name ASC
    regions.sort((a, b) => {
      const groupA = this.missionGroupMap.get(a.missionGroupId);
      const groupB = this.missionGroupMap.get(b.missionGroupId);

      const groupNameA = groupA?.name ?? '';
      const groupNameB = groupB?.name ?? '';
      if (groupNameA < groupNameB) return -1;
      if (groupNameA > groupNameB) return 1;

      return a.name.localeCompare(b.name);
    });

    // 페이지네이션
    const offset = params.offset ?? 0;
    const limit = params.limit ?? 20;
    const data = regions.slice(offset, offset + limit);

    return {
      data: data.map((r) => ({
        ...r,
        missionGroup: this.missionGroupMap.get(r.missionGroupId) ?? {
          id: r.missionGroupId,
          name: '',
        },
      })) as RegionWithMissionGroup[],
      total,
    };
  }

  async update(
    id: string,
    data: MissionaryRegionUpdateInput,
  ): Promise<MissionaryRegion> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`MissionaryRegion not found: ${id}`);
    }

    const updated: MissionaryRegion = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    return updated;
  }

  // --- 테스트 헬퍼 ---

  setMissionGroup(missionGroupId: string, info: MissionGroupInfo): void {
    this.missionGroupMap.set(missionGroupId, info);
  }

  clear(): void {
    this.store.clear();
    this.missionGroupMap.clear();
  }

  getAll(): MissionaryRegion[] {
    return [...this.store.values()];
  }
}
