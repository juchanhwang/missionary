import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import type {
  MissionaryPosterCreateInput,
  MissionaryPosterRepository,
} from './missionary-poster-repository.interface';
import type { MissionaryPoster } from '../../../prisma/generated/prisma';

@Injectable()
export class PrismaMissionaryPosterRepository implements MissionaryPosterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: MissionaryPosterCreateInput): Promise<MissionaryPoster> {
    return this.prisma.missionaryPoster.create({ data });
  }

  async findByMissionary(missionaryId: string): Promise<MissionaryPoster[]> {
    return this.prisma.missionaryPoster.findMany({
      where: { missionaryId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdAndMissionary(
    id: string,
    missionaryId: string,
  ): Promise<MissionaryPoster | null> {
    return this.prisma.missionaryPoster.findFirst({
      where: { id, missionaryId },
    });
  }

  async delete(id: string): Promise<MissionaryPoster> {
    return this.prisma.missionaryPoster.delete({
      where: { id },
    });
  }
}
