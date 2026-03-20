import { randomUUID } from 'crypto';

import type {
  FindAllRegionsParams,
  FindAllRegionsResult,
  MissionaryRegionCreateInput,
  MissionaryRegionRepository,
  MissionaryRegionUpdateInput,
  RegionWithMissionary,
} from '@/missionary/repositories/missionary-region-repository.interface';

import type { MissionaryRegion } from '../../../prisma/generated/prisma';

interface MissionaryInfo {
  id: string;
  name: string;
  order: number | null;
  missionGroupId: string | null;
  missionGroup: { id: string; name: string } | null;
}

export class FakeMissionaryRegionRepository implements MissionaryRegionRepository {
  private store = new Map<string, MissionaryRegion>();
  private missionaryMap = new Map<string, MissionaryInfo>();

  async create(data: MissionaryRegionCreateInput): Promise<MissionaryRegion> {
    const now = new Date();
    const entity: MissionaryRegion = {
      id: data.id ?? randomUUID(),
      missionaryId: data.missionaryId,
      name: data.name,
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

  async findByMissionary(missionaryId: string): Promise<MissionaryRegion[]> {
    return [...this.store.values()]
      .filter((r) => r.missionaryId === missionaryId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByIdAndMissionary(
    id: string,
    missionaryId: string,
  ): Promise<MissionaryRegion | null> {
    const entity = this.store.get(id);
    if (!entity || entity.missionaryId !== missionaryId) return null;
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
    if (params.missionaryId) {
      regions = regions.filter((r) => r.missionaryId === params.missionaryId);
    } else if (params.missionGroupId) {
      regions = regions.filter((r) => {
        const missionary = this.missionaryMap.get(r.missionaryId);
        return missionary?.missionGroupId === params.missionGroupId;
      });
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

    // 정렬: missionGroup.name ASC → missionary.order DESC → name ASC
    regions.sort((a, b) => {
      const mA = this.missionaryMap.get(a.missionaryId);
      const mB = this.missionaryMap.get(b.missionaryId);

      const groupNameA = mA?.missionGroup?.name ?? '';
      const groupNameB = mB?.missionGroup?.name ?? '';
      if (groupNameA < groupNameB) return -1;
      if (groupNameA > groupNameB) return 1;

      const orderA = mA?.order ?? 0;
      const orderB = mB?.order ?? 0;
      if (orderB !== orderA) return orderB - orderA;

      return a.name.localeCompare(b.name);
    });

    // 페이지네이션
    const offset = params.offset ?? 0;
    const limit = params.limit ?? 20;
    const data = regions.slice(offset, offset + limit);

    return {
      data: data.map((r) => ({
        ...r,
        missionary: this.missionaryMap.get(r.missionaryId) ?? {
          id: r.missionaryId,
          name: '',
          order: null,
          missionGroupId: null,
          missionGroup: null,
        },
      })) as RegionWithMissionary[],
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

  setMissionary(missionaryId: string, info: MissionaryInfo): void {
    this.missionaryMap.set(missionaryId, info);
  }

  clear(): void {
    this.store.clear();
    this.missionaryMap.clear();
  }

  getAll(): MissionaryRegion[] {
    return [...this.store.values()];
  }
}
