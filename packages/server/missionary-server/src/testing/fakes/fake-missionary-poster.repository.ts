import { randomUUID } from 'crypto';

import type {
  MissionaryPosterCreateInput,
  MissionaryPosterRepository,
} from '@/missionary/repositories/missionary-poster-repository.interface';

import type { MissionaryPoster } from '../../../prisma/generated/prisma';

export class FakeMissionaryPosterRepository implements MissionaryPosterRepository {
  private store = new Map<string, MissionaryPoster>();

  async create(data: MissionaryPosterCreateInput): Promise<MissionaryPoster> {
    const now = new Date();
    const entity: MissionaryPoster = {
      id: data.id ?? randomUUID(),
      missionaryId: data.missionaryId,
      name: data.name,
      path: data.path,
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

  async findByMissionary(missionaryId: string): Promise<MissionaryPoster[]> {
    return [...this.store.values()]
      .filter((p) => p.missionaryId === missionaryId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByIdAndMissionary(
    id: string,
    missionaryId: string,
  ): Promise<MissionaryPoster | null> {
    const entity = this.store.get(id);
    if (!entity || entity.missionaryId !== missionaryId) return null;
    return entity;
  }

  async delete(id: string): Promise<MissionaryPoster> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`MissionaryPoster not found: ${id}`);
    }
    this.store.delete(id);
    return existing;
  }

  // --- 테스트 헬퍼 ---

  clear(): void {
    this.store.clear();
  }

  getAll(): MissionaryPoster[] {
    return [...this.store.values()];
  }
}
