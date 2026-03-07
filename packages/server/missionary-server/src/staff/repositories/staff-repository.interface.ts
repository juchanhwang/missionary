import type { BaseRepository } from '@/common/repositories';

import type {
  Missionary,
  MissionaryStaff,
  Prisma,
  User,
} from '../../../prisma/generated/prisma';

export interface StaffWithRelations extends MissionaryStaff {
  missionary: Missionary;
  user: User;
}

export type StaffCreateInput = Prisma.MissionaryStaffUncheckedCreateInput;

export type StaffUpdateInput = Prisma.MissionaryStaffUncheckedUpdateInput;

export interface StaffRepository extends BaseRepository<
  MissionaryStaff,
  StaffCreateInput,
  StaffUpdateInput
> {
  findByMissionaryAndUser(
    missionaryId: string,
    userId: string,
  ): Promise<MissionaryStaff | null>;
  createWithRelations(data: StaffCreateInput): Promise<StaffWithRelations>;
  findByMissionary(missionaryId: string): Promise<StaffWithRelations[]>;
  findByIdWithRelations(id: string): Promise<StaffWithRelations | null>;
  updateWithRelations(
    id: string,
    data: StaffUpdateInput,
  ): Promise<StaffWithRelations>;
  deleteWithRelations(id: string): Promise<StaffWithRelations>;
}

export const STAFF_REPOSITORY = Symbol('STAFF_REPOSITORY');
