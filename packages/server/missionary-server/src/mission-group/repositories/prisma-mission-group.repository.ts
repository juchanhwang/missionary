import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import type {
  MissionGroupCreateInput,
  MissionGroupRepository,
  MissionGroupUpdateInput,
  MissionGroupWithCount,
  MissionGroupWithMissionaries,
} from './mission-group-repository.interface';
import type { MissionGroup } from '../../../prisma/generated/prisma';

@Injectable()
export class PrismaMissionGroupRepository implements MissionGroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: MissionGroupCreateInput): Promise<MissionGroup> {
    return this.prisma.missionGroup.create({ data });
  }

  async findMany(args?: {
    where?: Partial<MissionGroup>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<MissionGroup[]> {
    return this.prisma.missionGroup.findMany({
      where: args?.where,
      orderBy: args?.orderBy,
    });
  }

  async findUnique(where: Partial<MissionGroup>): Promise<MissionGroup | null> {
    return this.prisma.missionGroup.findUnique({
      where: where as { id: string },
    });
  }

  async findFirst(where: Partial<MissionGroup>): Promise<MissionGroup | null> {
    return this.prisma.missionGroup.findFirst({ where });
  }

  async update(
    id: string,
    data: MissionGroupUpdateInput,
  ): Promise<MissionGroup> {
    return this.prisma.missionGroup.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<MissionGroup> {
    return this.prisma.missionGroup.delete({
      where: { id },
    });
  }

  async count(where?: Partial<MissionGroup>): Promise<number> {
    return this.prisma.missionGroup.count({ where });
  }

  async findAllWithCount(): Promise<MissionGroupWithCount[]> {
    return this.prisma.missionGroup.findMany({
      include: {
        _count: {
          select: { missionaries: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findWithMissionaries(
    id: string,
  ): Promise<MissionGroupWithMissionaries | null> {
    return this.prisma.missionGroup.findUnique({
      where: { id },
      include: {
        missionaries: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findById(id: string): Promise<MissionGroup | null> {
    return this.prisma.missionGroup.findUnique({
      where: { id },
    });
  }
}
