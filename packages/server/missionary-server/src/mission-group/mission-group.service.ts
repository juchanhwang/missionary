import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import { CreateMissionGroupDto } from './dto/create-mission-group.dto';
import { UpdateMissionGroupDto } from './dto/update-mission-group.dto';

@Injectable()
export class MissionGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMissionGroupDto: CreateMissionGroupDto) {
    return this.prisma.missionGroup.create({
      data: createMissionGroupDto,
    });
  }

  async findAll() {
    return this.prisma.missionGroup.findMany({
      include: {
        _count: {
          select: { missionaries: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.missionGroup.findUnique({
      where: { id },
      include: {
        missionaries: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`MissionGroup #${id}을 찾을 수 없습니다`);
    }

    return group;
  }

  async update(id: string, updateMissionGroupDto: UpdateMissionGroupDto) {
    await this.findOne(id); // Verify exists

    return this.prisma.missionGroup.update({
      where: { id },
      data: updateMissionGroupDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verify exists

    // Check for existing missionaries
    const missionaryCount = await this.prisma.missionary.count({
      where: {
        missionGroupId: id,
      },
    });

    if (missionaryCount > 0) {
      throw new ConflictException(
        `Cannot delete mission group with ${missionaryCount} existing missionaries`,
      );
    }

    return this.prisma.missionGroup.delete({
      where: { id },
    });
  }
}
