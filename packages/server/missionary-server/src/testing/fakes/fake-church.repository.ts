import type {
  ChurchCreateInput,
  ChurchRepository,
  ChurchUpdateInput,
} from '@/church/repositories/church-repository.interface';

import { BaseFakeRepository } from './base-fake-repository';

import type { Church } from '../../../prisma/generated/prisma';

export class FakeChurchRepository
  extends BaseFakeRepository<Church, ChurchCreateInput, ChurchUpdateInput>
  implements ChurchRepository
{
  // --- ChurchRepository 전용 메서드 ---

  async findAll(): Promise<Church[]> {
    return [...this.store.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async findById(id: string): Promise<Church | null> {
    return this.store.get(id) ?? null;
  }

  // --- buildEntity ---

  protected buildEntity(data: ChurchCreateInput): Church {
    const now = this.now();
    return {
      id: data.id ?? this.generateId(),
      name: data.name,
      pastorName: data.pastorName ?? null,
      pastorPhone: data.pastorPhone ?? null,
      addressBasic: data.addressBasic ?? null,
      addressDetail: data.addressDetail ?? null,
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy ?? null,
      updatedBy: data.updatedBy ?? null,
      version: data.version ?? 0,
      deletedAt: null,
    };
  }
}
