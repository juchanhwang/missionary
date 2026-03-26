import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import type {
  FindAllFilters,
  FindAllResult,
  ParticipationCreateInput,
  ParticipationRepository,
  ParticipationUpdateInput,
  ParticipationWithRelations,
} from './participation-repository.interface';
import type { Participation, Prisma } from '../../../prisma/generated/prisma';

@Injectable()
export class PrismaParticipationRepository implements ParticipationRepository {
  private static readonly RELATIONS_INCLUDE = {
    missionary: true,
    user: true,
    team: true,
    attendanceOption: true,
    formAnswers: {
      include: { formField: true },
      where: { deletedAt: null },
    },
  } as const;

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
      include: PrismaParticipationRepository.RELATIONS_INCLUDE,
    }) as Promise<ParticipationWithRelations>;
  }

  async findAllFiltered(filters: FindAllFilters): Promise<FindAllResult> {
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

    if (filters.attendanceType) {
      where.attendanceOption = { type: filters.attendanceType };
    }

    if (filters.query) {
      where.name = { contains: filters.query, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.participation.findMany({
        where,
        include: PrismaParticipationRepository.RELATIONS_INCLUDE,
        orderBy: { createdAt: 'desc' },
        take: filters.limit ?? 20,
        skip: filters.offset ?? 0,
      }),
      this.prisma.participation.count({ where }),
    ]);

    return {
      data: data as ParticipationWithRelations[],
      total,
    };
  }

  async findOneWithRelations(
    id: string,
  ): Promise<ParticipationWithRelations | null> {
    return this.prisma.participation.findFirst({
      where: { id, deletedAt: null },
      include: PrismaParticipationRepository.RELATIONS_INCLUDE,
    }) as Promise<ParticipationWithRelations | null>;
  }

  async updateWithRelations(
    id: string,
    data: ParticipationUpdateInput,
  ): Promise<ParticipationWithRelations> {
    return this.prisma.participation.update({
      where: { id },
      data,
      include: PrismaParticipationRepository.RELATIONS_INCLUDE,
    }) as Promise<ParticipationWithRelations>;
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
        include: PrismaParticipationRepository.RELATIONS_INCLUDE,
      });

      await tx.missionary.update({
        where: { id: missionaryId },
        data: {
          currentParticipantCount: { increment: 1 },
        },
      });

      return participation as ParticipationWithRelations;
    });
  }
}
