import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import type {
  TeamCreateInput,
  TeamRepository,
  TeamUpdateInput,
  TeamWithRelations,
} from './team-repository.interface';
import type { Prisma, Team } from '../../../prisma/generated/prisma';

const TEAM_INCLUDE = {
  missionary: true,
  church: true,
  missionaryRegion: true,
  teamMembers: {
    where: { deletedAt: null },
    include: { user: true },
  },
} satisfies Prisma.TeamInclude;

@Injectable()
export class PrismaTeamRepository implements TeamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: TeamCreateInput): Promise<Team> {
    return this.prisma.team.create({ data });
  }

  async findMany(args?: {
    where?: Partial<Team>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<Team[]> {
    return this.prisma.team.findMany({
      where: args?.where,
      orderBy: args?.orderBy,
    });
  }

  async findUnique(where: Partial<Team>): Promise<Team | null> {
    return this.prisma.team.findUnique({
      where: where as { id: string },
    });
  }

  async findFirst(where: Partial<Team>): Promise<Team | null> {
    return this.prisma.team.findFirst({ where });
  }

  async update(where: Partial<Team>, data: TeamUpdateInput): Promise<Team> {
    return this.prisma.team.update({
      where: where as { id: string },
      data,
    });
  }

  async delete(where: Partial<Team>): Promise<Team> {
    return this.prisma.team.delete({
      where: where as { id: string },
    });
  }

  async count(where?: Partial<Team>): Promise<number> {
    return this.prisma.team.count({ where });
  }

  async createWithRelations(data: TeamCreateInput): Promise<TeamWithRelations> {
    return this.prisma.team.create({
      data,
      include: TEAM_INCLUDE,
    });
  }

  async findAll(missionaryId?: string): Promise<TeamWithRelations[]> {
    const where: Prisma.TeamWhereInput = {};

    if (missionaryId) {
      where.missionaryId = missionaryId;
    }

    return this.prisma.team.findMany({
      where,
      include: TEAM_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findWithMembers(id: string): Promise<TeamWithRelations | null> {
    return this.prisma.team.findUnique({
      where: { id },
      include: TEAM_INCLUDE,
    });
  }

  async updateWithRelations(
    id: string,
    data: TeamUpdateInput,
  ): Promise<TeamWithRelations> {
    return this.prisma.team.update({
      where: { id },
      data,
      include: TEAM_INCLUDE,
    });
  }

  async addMembers(teamId: string, userIds: string[]): Promise<void> {
    const createPromises = userIds.map((userId) =>
      this.prisma.teamMember.create({
        data: { teamId, userId },
      }),
    );

    await Promise.all(createPromises);
  }

  async softDeleteMembers(teamId: string, userIds: string[]): Promise<void> {
    const updatePromises = userIds.map((userId) =>
      this.prisma.teamMember.updateMany({
        where: { teamId, userId, deletedAt: null },
        data: { deletedAt: new Date() },
      }),
    );

    await Promise.all(updatePromises);
  }

  async deleteWithDetachParticipants(id: string): Promise<Team> {
    // 팀 삭제 시 연결된 participation의 teamId를 명시적으로 NULL 처리한 뒤 soft delete.
    // PrismaService.$extends의 delete 확장은 $transaction 내부에서 this 컨텍스트가
    // 트랜잭션 클라이언트가 아닌 루트 클라이언트를 참조하므로 update를 직접 호출한다.
    return this.prisma.$transaction(async (tx) => {
      await tx.participation.updateMany({
        where: { teamId: id },
        data: { teamId: null },
      });
      return tx.team.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  }
}
