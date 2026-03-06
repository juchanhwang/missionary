import type { BaseRepository } from '@/common/repositories';

import type {
  MissionaryCategory,
  MissionGroup,
  Missionary,
} from '../../../prisma/generated/prisma';

export interface MissionGroupCreateInput {
  id?: string;
  name: string;
  description?: string | null;
  category: MissionaryCategory;
}

export interface MissionGroupUpdateInput {
  name?: string;
  description?: string | null;
  category?: MissionaryCategory;
}

export type MissionGroupWithCount = MissionGroup & {
  _count: { missionaries: number };
};

export type MissionGroupWithMissionaries = MissionGroup & {
  missionaries: Missionary[];
};

export interface MissionGroupRepository extends Omit<
  BaseRepository<
    MissionGroup,
    MissionGroupCreateInput,
    MissionGroupUpdateInput
  >,
  'update' | 'delete'
> {
  findAllWithCount(): Promise<MissionGroupWithCount[]>;
  findWithMissionaries(
    id: string,
  ): Promise<MissionGroupWithMissionaries | null>;
  findById(id: string): Promise<MissionGroup | null>;
  update(id: string, data: MissionGroupUpdateInput): Promise<MissionGroup>;
  delete(id: string): Promise<MissionGroup>;
}

export const MISSION_GROUP_REPOSITORY = Symbol('MISSION_GROUP_REPOSITORY');
