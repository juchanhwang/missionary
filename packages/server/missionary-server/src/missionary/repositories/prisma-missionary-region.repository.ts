import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import type {
  FindAllRegionsParams,
  FindAllRegionsResult,
  MissionaryRegionCreateInput,
  MissionaryRegionRepository,
  MissionaryRegionUpdateInput,
  RegionWithMissionGroup,
} from './missionary-region-repository.interface';
import type {
  MissionaryRegion,
  Prisma,
} from '../../../prisma/generated/prisma';

@Injectable()
export class PrismaMissionaryRegionRepository implements MissionaryRegionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: MissionaryRegionCreateInput): Promise<MissionaryRegion> {
    return this.prisma.missionaryRegion.create({ data });
  }

  async findByMissionGroup(
    missionGroupId: string,
  ): Promise<MissionaryRegion[]> {
    return this.prisma.missionaryRegion.findMany({
      where: { missionGroupId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdAndMissionGroup(
    id: string,
    missionGroupId: string,
  ): Promise<MissionaryRegion | null> {
    return this.prisma.missionaryRegion.findFirst({
      where: { id, missionGroupId },
    });
  }

  async delete(id: string): Promise<MissionaryRegion> {
    return this.prisma.missionaryRegion.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findAllWithFilters(
    params: FindAllRegionsParams,
  ): Promise<FindAllRegionsResult> {
    const where: Prisma.MissionaryRegionWhereInput = {
      deletedAt: null,
    };

    if (params.missionGroupId) {
      where.missionGroupId = params.missionGroupId;
    }

    if (params.query) {
      where.OR = [
        { name: { contains: params.query, mode: 'insensitive' } },
        { pastorName: { contains: params.query, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.missionaryRegion.findMany({
        where,
        include: {
          missionGroup: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ missionGroup: { name: 'asc' } }, { name: 'asc' }],
        take: params.limit ?? 20,
        skip: params.offset ?? 0,
      }),
      this.prisma.missionaryRegion.count({
        where: { ...where, deletedAt: null },
      }),
    ]);

    return {
      data: data as RegionWithMissionGroup[],
      total,
    };
  }

  async findDeletedWithFilters(
    params: FindAllRegionsParams,
  ): Promise<FindAllRegionsResult> {
    const where: Prisma.MissionaryRegionWhereInput = {
      deletedAt: { not: null },
    };

    if (params.missionGroupId) {
      where.missionGroupId = params.missionGroupId;
    }

    if (params.query) {
      where.OR = [
        { name: { contains: params.query, mode: 'insensitive' } },
        { pastorName: { contains: params.query, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.missionaryRegion.findMany({
        where,
        include: {
          missionGroup: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ missionGroup: { name: 'asc' } }, { name: 'asc' }],
        take: params.limit ?? 20,
        skip: params.offset ?? 0,
      }),
      this.prisma.missionaryRegion.count({ where }),
    ]);

    return {
      data: data as RegionWithMissionGroup[],
      total,
    };
  }

  async findDeletedByIdAndMissionGroup(
    id: string,
    missionGroupId: string,
  ): Promise<MissionaryRegion | null> {
    return this.prisma.missionaryRegion.findFirst({
      where: { id, missionGroupId, deletedAt: { not: null } },
    });
  }

  async restore(id: string): Promise<MissionaryRegion> {
    return this.prisma.missionaryRegion.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async update(
    id: string,
    data: MissionaryRegionUpdateInput,
  ): Promise<MissionaryRegion> {
    return this.prisma.missionaryRegion.update({
      where: { id, deletedAt: null },
      data,
    });
  }
}
