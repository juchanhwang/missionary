import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import type {
  MissionaryRegionCreateInput,
  MissionaryRegionRepository,
  MissionaryRegionUpdateInput,
} from './missionary-region-repository.interface';
import type { MissionaryRegion } from '../../../prisma/generated/prisma';

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

  async update(
    id: string,
    data: MissionaryRegionUpdateInput,
  ): Promise<MissionaryRegion> {
    return this.prisma.missionaryRegion.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<MissionaryRegion> {
    return this.prisma.missionaryRegion.delete({
      where: { id },
    });
  }
}
