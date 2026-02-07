import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';

@Injectable()
export class MissionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateMissionDto) {
    return this.prisma.missionary.create({
      data: {
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        pastorName: dto.pastorName,
        createdById: userId,
        regionId: 'placeholder-region-id',
        participationStartDate: new Date(dto.startDate),
        participationEndDate: new Date(dto.endDate),
        staff: {
          create: {
            userId: userId,
            role: 'LEADER' as const,
          },
        },
      },
      include: { staff: true },
    });
  }

  async findAll() {
    return this.prisma.missionary.findMany({
      include: { staff: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.missionary.findUnique({
      where: { id },
      include: { staff: true },
    });
  }

  async update(id: string, dto: UpdateMissionDto) {
    const data: Record<string, any> = {};

    if ('name' in dto && dto.name !== undefined) data.name = dto.name;
    if ('startDate' in dto && dto.startDate !== undefined)
      data.startDate = new Date(dto.startDate);
    if ('endDate' in dto && dto.endDate !== undefined)
      data.endDate = new Date(dto.endDate);
    if ('pastorName' in dto && dto.pastorName !== undefined)
      data.pastorName = dto.pastorName;
    if ('status' in dto && dto.status !== undefined) data.status = dto.status;

    return this.prisma.missionary.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.missionary.delete({
      where: { id },
    });
  }
}
