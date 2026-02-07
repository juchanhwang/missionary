import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';

import type { MissionMemberRole } from '../../prisma/generated/prisma/enums';

@Injectable()
export class MissionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateMissionDto) {
    return this.prisma.mission.create({
      data: {
        name: dto.name,
        type: dto.type,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        pastorName: dto.pastorName,
        createdById: userId,
        members: {
          create: {
            userId: userId,
            role: 'LEADER' as const,
          },
        },
      },
      include: { members: true },
    });
  }

  async findAll() {
    return this.prisma.mission.findMany({
      include: { members: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.mission.findUnique({
      where: { id },
      include: { members: true },
    });
  }

  async update(id: number, dto: UpdateMissionDto) {
    const data: Record<string, any> = {};

    if ('name' in dto && dto.name !== undefined) data.name = dto.name;
    if ('type' in dto && dto.type !== undefined) data.type = dto.type;
    if ('startDate' in dto && dto.startDate !== undefined)
      data.startDate = new Date(dto.startDate);
    if ('endDate' in dto && dto.endDate !== undefined)
      data.endDate = new Date(dto.endDate);
    if ('pastorName' in dto && dto.pastorName !== undefined)
      data.pastorName = dto.pastorName;
    if ('status' in dto && dto.status !== undefined) data.status = dto.status;

    return this.prisma.mission.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.mission.delete({
      where: { id },
    });
  }
}
