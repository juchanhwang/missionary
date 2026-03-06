import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import type {
  FindAllFilters,
  ParticipationCreateInput,
  ParticipationRepository,
  ParticipationUpdateInput,
  ParticipationWithRelations,
} from './participation-repository.interface';
import type { Participation, Prisma } from '../../../prisma/generated/prisma';

@Injectable()
export class PrismaParticipationRepository implements ParticipationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ParticipationCreateInput): Promise<Participation> {
    return this.prisma.participation.create({ data });
  }

  async findMany(args?: {
    where?: Partial<Participation>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<Participation[]> {
    return this.prisma.participation.findMany({
      where: args?.where,
      orderBy: args?.orderBy,
    });
  }

  async findUnique(
    where: Partial<Participation>,
  ): Promise<Participation | null> {
    return this.prisma.participation.findUnique({
      where: where as { id: string },
    });
  }

  async findFirst(
    where: Partial<Participation>,
  ): Promise<Participation | null> {
    return this.prisma.participation.findFirst({ where });
  }

  async update(
    where: Partial<Participation>,
    data: ParticipationUpdateInput,
  ): Promise<Participation> {
    return this.prisma.participation.update({
      where: where as { id: string },
      data,
    });
  }

  async delete(where: Partial<Participation>): Promise<Participation> {
    return this.prisma.participation.delete({
      where: where as { id: string },
    });
  }

  async count(where?: Partial<Participation>): Promise<number> {
    return this.prisma.participation.count({ where });
  }

  async createWithRelations(
    data: ParticipationCreateInput,
  ): Promise<ParticipationWithRelations> {
    return this.prisma.participation.create({
      data,
      include: { missionary: true, user: true },
    });
  }

  async findAllFiltered(
    filters: FindAllFilters,
  ): Promise<ParticipationWithRelations[]> {
    const where: Prisma.ParticipationWhereInput = {};

    if (filters.missionaryId) {
      where.missionaryId = filters.missionaryId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.isPaid !== undefined) {
      where.isPaid = filters.isPaid;
    }

    return this.prisma.participation.findMany({
      where,
      include: { missionary: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneWithRelations(
    id: string,
  ): Promise<ParticipationWithRelations | null> {
    return this.prisma.participation.findFirst({
      where: { id },
      include: { missionary: true, user: true },
    });
  }

  async updateWithRelations(
    id: string,
    data: ParticipationUpdateInput,
  ): Promise<ParticipationWithRelations> {
    return this.prisma.participation.update({
      where: { id },
      data,
      include: { missionary: true, user: true },
    });
  }

  async approvePayments(ids: string[]): Promise<number> {
    const result = await this.prisma.participation.updateMany({
      where: { id: { in: ids } },
      data: { isPaid: true },
    });

    return result.count;
  }

  async softDeleteWithCountDecrement(
    id: string,
    userId: string,
    missionaryId: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.participation.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          updatedBy: userId,
        },
      }),
      this.prisma.missionary.update({
        where: { id: missionaryId },
        data: {
          currentParticipantCount: { decrement: 1 },
        },
      }),
    ]);
  }

  async createAndIncrementCount(
    data: ParticipationCreateInput,
    missionaryId: string,
  ): Promise<ParticipationWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const participation = await tx.participation.create({
        data,
        include: { missionary: true, user: true },
      });

      await tx.missionary.update({
        where: { id: missionaryId },
        data: {
          currentParticipantCount: { increment: 1 },
        },
      });

      return participation;
    });
  }
}
