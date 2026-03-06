import type {
  MissionGroupCreateInput,
  MissionGroupRepository,
  MissionGroupUpdateInput,
  MissionGroupWithCount,
  MissionGroupWithMissionaries,
} from '@/mission-group/repositories/mission-group-repository.interface';

import { BaseFakeRepository } from './base-fake-repository';

import type {
  MissionGroup,
  Missionary,
  MissionaryCategory,
} from '../../../prisma/generated/prisma';

export class FakeMissionGroupRepository
  extends BaseFakeRepository<
    MissionGroup,
    MissionGroupCreateInput,
    MissionGroupUpdateInput
  >
  implements MissionGroupRepository
{
  /**
   * missionaries 저장소.
   * findWithMissionaries / findAllWithCount 에서 사용한다.
   * 테스트에서 `setMissionaries(groupId, missionaries)` 로 세팅한다.
   */
  private missionariesByGroup = new Map<string, Missionary[]>();

  // --- MissionGroupRepository 전용 메서드 ---

  async findAllWithCount(): Promise<MissionGroupWithCount[]> {
    const groups = [...this.store.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    return groups.map((group) => ({
      ...group,
      _count: {
        missionaries: (this.missionariesByGroup.get(group.id) ?? []).length,
      },
    }));
  }

  async findWithMissionaries(
    id: string,
  ): Promise<MissionGroupWithMissionaries | null> {
    const group = this.store.get(id);
    if (!group) return null;

    const missionaries = (this.missionariesByGroup.get(id) ?? [])
      .filter((m) => m.deletedAt === null)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return { ...group, missionaries };
  }

  async findById(id: string): Promise<MissionGroup | null> {
    return this.store.get(id) ?? null;
  }

  // MissionGroupRepository의 update/delete는 id 기반 시그니처
  async update(
    id: string,
    data: MissionGroupUpdateInput,
  ): Promise<MissionGroup>;
  async update(
    where: Partial<MissionGroup>,
    data: MissionGroupUpdateInput,
  ): Promise<MissionGroup>;
  async update(
    idOrWhere: string | Partial<MissionGroup>,
    data: MissionGroupUpdateInput,
  ): Promise<MissionGroup> {
    const where =
      typeof idOrWhere === 'string'
        ? ({ id: idOrWhere } as Partial<MissionGroup>)
        : idOrWhere;
    return super.update(where, data);
  }

  async delete(id: string): Promise<MissionGroup>;
  async delete(where: Partial<MissionGroup>): Promise<MissionGroup>;
  async delete(
    idOrWhere: string | Partial<MissionGroup>,
  ): Promise<MissionGroup> {
    const where =
      typeof idOrWhere === 'string'
        ? ({ id: idOrWhere } as Partial<MissionGroup>)
        : idOrWhere;
    return super.delete(where);
  }

  // --- 테스트 헬퍼 ---

  setMissionaries(groupId: string, missionaries: Missionary[]): void {
    this.missionariesByGroup.set(groupId, missionaries);
  }

  clearMissionaries(): void {
    this.missionariesByGroup.clear();
  }

  override clear(): void {
    super.clear();
    this.missionariesByGroup.clear();
  }

  // --- buildEntity ---

  protected buildEntity(data: MissionGroupCreateInput): MissionGroup {
    const now = this.now();
    return {
      id: data.id ?? this.generateId(),
      name: data.name,
      description: data.description ?? null,
      category: data.category as MissionaryCategory,
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      updatedBy: null,
      version: 1,
      deletedAt: null,
    };
  }
}
