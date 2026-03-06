import type { BaseRepository } from '@/common/repositories';

import type {
  Church,
  Missionary,
  Prisma,
  Team,
  TeamMember,
  User,
} from '../../../prisma/generated/prisma';

export interface TeamMemberWithUser extends TeamMember {
  user: User;
}

export interface TeamWithRelations extends Team {
  missionary: Missionary;
  church: Church | null;
  teamMembers: TeamMemberWithUser[];
}

export type TeamCreateInput = Prisma.TeamUncheckedCreateInput;

export type TeamUpdateInput = Prisma.TeamUpdateInput;

export interface TeamRepository extends BaseRepository<
  Team,
  TeamCreateInput,
  TeamUpdateInput
> {
  createWithRelations(data: TeamCreateInput): Promise<TeamWithRelations>;
  findAll(missionaryId?: string): Promise<TeamWithRelations[]>;
  findWithMembers(id: string): Promise<TeamWithRelations | null>;
  updateWithRelations(
    id: string,
    data: TeamUpdateInput,
  ): Promise<TeamWithRelations>;
  addMembers(teamId: string, userIds: string[]): Promise<void>;
  softDeleteMembers(teamId: string, userIds: string[]): Promise<void>;
}

export const TEAM_REPOSITORY = Symbol('TEAM_REPOSITORY');
