import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import type {
  MissionaryCreateInput,
  MissionaryRepository,
  MissionaryUpdateInput,
  MissionaryWithDetails,
  MissionaryWithGroup,
} from './missionary-repository.interface';
import type { Missionary } from '../../../prisma/generated/prisma';

@Injectable()
export class PrismaMissionaryRepository implements MissionaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: MissionaryCreateInput): Promise<MissionaryWithGroup> {
    return this.prisma.missionary.create({
      data,
      include: { missionGroup: true },
    });
  }

  async findAll(): Promise<MissionaryWithGroup[]> {
    return this.prisma.missionary.findMany({
      include: { missionGroup: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findWithDetails(id: string): Promise<MissionaryWithDetails | null> {
    return this.prisma.missionary.findUnique({
      where: { id },
      include: {
        missionGroup: true,
        posters: true,
      },
    });
  }

  async update(
    id: string,
    data: MissionaryUpdateInput,
  ): Promise<MissionaryWithGroup> {
    return this.prisma.missionary.update({
      where: { id },
      data,
      include: { missionGroup: true },
    });
  }

  async delete(id: string): Promise<Missionary> {
    return this.prisma.missionary.delete({
      where: { id },
    });
  }

  async getMaxOrder(missionGroupId: string): Promise<number | null> {
    const result = await this.prisma.missionary.aggregate({
      where: { missionGroupId },
      _max: { order: true },
    });
    return result._max.order;
  }

  async count(where: { missionGroupId?: string }): Promise<number> {
    return this.prisma.missionary.count({ where });
  }
}
