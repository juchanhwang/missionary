import type { BaseRepository } from '@/common/repositories';

import type {
  Participation,
  Missionary,
  MissionaryAttendanceOption,
  ParticipationFormAnswer,
  User,
  Team,
  Prisma,
} from '../../../prisma/generated/prisma';

export interface ParticipationWithRelations extends Participation {
  missionary: Missionary;
  user: User;
  team: Team | null;
  attendanceOption: MissionaryAttendanceOption | null;
  formAnswers: ParticipationFormAnswer[];
}

export interface FindAllFilters {
  missionaryId?: string;
  userId?: string;
  isPaid?: boolean;
  attendanceType?: 'FULL' | 'PARTIAL';
  query?: string;
  limit?: number;
  offset?: number;
}

export interface FindAllResult {
  data: ParticipationWithRelations[];
  total: number;
}

export type ParticipationCreateInput = Prisma.ParticipationUncheckedCreateInput;

export type ParticipationUpdateInput = Prisma.ParticipationUncheckedUpdateInput;

export interface ParticipationRepository extends BaseRepository<
  Participation,
  ParticipationCreateInput,
  ParticipationUpdateInput
> {
  createWithRelations(
    data: ParticipationCreateInput,
  ): Promise<ParticipationWithRelations>;
  findAllFiltered(filters: FindAllFilters): Promise<FindAllResult>;
  findOneWithRelations(id: string): Promise<ParticipationWithRelations | null>;
  updateWithRelations(
    id: string,
    data: ParticipationUpdateInput,
  ): Promise<ParticipationWithRelations>;
  approvePayments(ids: string[]): Promise<number>;
  softDeleteWithCountDecrement(
    id: string,
    userId: string,
    missionaryId: string,
  ): Promise<void>;
  createAndIncrementCount(
    data: ParticipationCreateInput,
    missionaryId: string,
  ): Promise<ParticipationWithRelations>;
}

export const PARTICIPATION_REPOSITORY = Symbol('PARTICIPATION_REPOSITORY');
