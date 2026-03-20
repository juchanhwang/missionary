import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import type {
  FindAllRegionsParams,
  FindAllRegionsResult,
  MissionaryRegionCreateInput,
  MissionaryRegionRepository,
  MissionaryRegionUpdateInput,
  RegionWithMissionary,
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

  async findByMissionary(missionaryId: string): Promise<MissionaryRegion[]> {
    return this.prisma.missionaryRegion.findMany({
      where: { missionaryId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdAndMissionary(
    id: string,
    missionaryId: string,
  ): Promise<MissionaryRegion | null> {
    return this.prisma.missionaryRegion.findFirst({
      where: { id, missionaryId },
    });
  }

  async delete(id: string): Promise<MissionaryRegion> {
    return this.prisma.missionaryRegion.delete({
      where: { id },
    });
  }

  async findAllWithFilters(
    params: FindAllRegionsParams,
  ): Promise<FindAllRegionsResult> {
    const where: Prisma.MissionaryRegionWhereInput = {};

    if (params.missionaryId) {
      where.missionaryId = params.missionaryId;
    } else if (params.missionGroupId) {
      where.missionary = {
        missionGroupId: params.missionGroupId,
      };
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
          missionary: {
            include: {
              missionGroup: true,
            },
          },
        },
        orderBy: [
          { missionary: { missionGroup: { name: 'asc' } } },
          { missionary: { order: 'desc' } },
          { name: 'asc' },
        ],
        take: params.limit ?? 20,
        skip: params.offset ?? 0,
      }),
      // count에는 soft delete 필터 자동 적용 안 됨 — 수동 추가
      this.prisma.missionaryRegion.count({
        where: { ...where, deletedAt: null },
      }),
    ]);

    return {
      data: data as RegionWithMissionary[],
      total,
    };
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
