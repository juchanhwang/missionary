import { randomUUID } from 'crypto';

import type {
  MissionaryCreateInput,
  MissionaryRepository,
  MissionaryUpdateInput,
  MissionaryWithDetails,
  MissionaryWithGroup,
} from '@/missionary/repositories/missionary-repository.interface';

import type {
  Missionary,
  MissionGroup,
  MissionaryPoster,
  MissionStatus,
} from '../../../prisma/generated/prisma';

export class FakeMissionaryRepository implements MissionaryRepository {
  private store = new Map<string, Missionary>();

  /**
   * missionGroup 조회를 위한 저장소.
   * 테스트에서 `setGroup(id, group)` 으로 세팅한다.
   */
  private groups = new Map<string, MissionGroup>();

  /**
   * sub-resource 조회를 위한 저장소.
   * findWithDetails 에서 사용한다.
   */
  private postersByMissionary = new Map<string, MissionaryPoster[]>();

  async create(data: MissionaryCreateInput): Promise<MissionaryWithGroup> {
    const now = new Date();
    const entity: Missionary = {
      id: data.id ?? randomUUID(),
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      pastorName: data.pastorName ?? null,
      pastorPhone: data.pastorPhone ?? null,
      participationStartDate: data.participationStartDate ?? null,
      participationEndDate: data.participationEndDate ?? null,
      price: data.price ?? null,
      description: data.description ?? null,
      maximumParticipantCount: data.maximumParticipantCount ?? null,
      currentParticipantCount: 0,
      bankName: data.bankName ?? null,
      bankAccountHolder: data.bankAccountHolder ?? null,
      bankAccountNumber: data.bankAccountNumber ?? null,
      status: (data.status ?? 'ENROLLMENT_OPENED') as MissionStatus,
      missionGroupId: data.missionGroupId ?? null,
      createdById: data.createdById,
      order: data.order ?? null,
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      updatedBy: null,
      version: 0,
      deletedAt: null,
    };

    this.store.set(entity.id, entity);

    const missionGroup = entity.missionGroupId
      ? (this.groups.get(entity.missionGroupId) ?? null)
      : null;

    return { ...entity, missionGroup };
  }

  async findAll(): Promise<MissionaryWithGroup[]> {
    return [...this.store.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((entity) => ({
        ...entity,
        missionGroup: entity.missionGroupId
          ? (this.groups.get(entity.missionGroupId) ?? null)
          : null,
      }));
  }

  async findWithDetails(id: string): Promise<MissionaryWithDetails | null> {
    const entity = this.store.get(id);
    if (!entity) return null;

    return {
      ...entity,
      missionGroup: entity.missionGroupId
        ? (this.groups.get(entity.missionGroupId) ?? null)
        : null,
      posters: this.postersByMissionary.get(id) ?? [],
    };
  }

  async update(
    id: string,
    data: MissionaryUpdateInput,
  ): Promise<MissionaryWithGroup> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Missionary not found: ${id}`);
    }

    const updated: Missionary = {
      ...existing,
      ...(data as object),
      updatedAt: new Date(),
    };
    this.store.set(id, updated);

    const missionGroup = updated.missionGroupId
      ? (this.groups.get(updated.missionGroupId) ?? null)
      : null;

    return { ...updated, missionGroup };
  }

  async delete(id: string): Promise<Missionary> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Missionary not found: ${id}`);
    }
    this.store.delete(id);
    return existing;
  }

  async getMaxOrder(missionGroupId: string): Promise<number | null> {
    const missionaries = [...this.store.values()].filter(
      (m) => m.missionGroupId === missionGroupId,
    );

    if (missionaries.length === 0) return null;

    return Math.max(...missionaries.map((m) => m.order ?? 0));
  }

  async count(where: { missionGroupId?: string }): Promise<number> {
    let results = [...this.store.values()];
    if (where.missionGroupId) {
      results = results.filter(
        (m) => m.missionGroupId === where.missionGroupId,
      );
    }
    return results.length;
  }

  // --- 테스트 헬퍼 ---

  setGroup(id: string, group: MissionGroup): void {
    this.groups.set(id, group);
  }

  setPosters(missionaryId: string, posters: MissionaryPoster[]): void {
    this.postersByMissionary.set(missionaryId, posters);
  }

  clear(): void {
    this.store.clear();
    this.groups.clear();
    this.postersByMissionary.clear();
  }

  getAll(): Missionary[] {
    return [...this.store.values()];
  }
}
