import { randomUUID } from 'crypto';

import type {
  MissionaryRegionCreateInput,
  MissionaryRegionRepository,
} from '@/missionary/repositories/missionary-region-repository.interface';

import type { MissionaryRegion } from '../../../prisma/generated/prisma';

export class FakeMissionaryRegionRepository implements MissionaryRegionRepository {
  private store = new Map<string, MissionaryRegion>();

  async create(data: MissionaryRegionCreateInput): Promise<MissionaryRegion> {
    const now = new Date();
    const entity: MissionaryRegion = {
      id: data.id ?? randomUUID(),
      missionaryId: data.missionaryId,
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

  // --- 테스트 헬퍼 ---

  clear(): void {
    this.store.clear();
  }

  getAll(): MissionaryRegion[] {
    return [...this.store.values()];
  }
}
