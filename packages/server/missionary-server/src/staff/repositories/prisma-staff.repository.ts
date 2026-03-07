import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import type {
  StaffCreateInput,
  StaffRepository,
  StaffUpdateInput,
  StaffWithRelations,
} from './staff-repository.interface';
import type { MissionaryStaff } from '../../../prisma/generated/prisma';

const STAFF_INCLUDE = {
  missionary: true,
  user: true,
} as const;

@Injectable()
export class PrismaStaffRepository implements StaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: StaffCreateInput): Promise<MissionaryStaff> {
    return this.prisma.missionaryStaff.create({ data });
  }

  async findMany(args?: {
    where?: Partial<MissionaryStaff>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<MissionaryStaff[]> {
    return this.prisma.missionaryStaff.findMany({
      where: args?.where,
      orderBy: args?.orderBy,
    });
  }

  async findUnique(
    where: Partial<MissionaryStaff>,
  ): Promise<MissionaryStaff | null> {
    return this.prisma.missionaryStaff.findUnique({
      where: where as { id: string },
    });
  }

  async findFirst(
    where: Partial<MissionaryStaff>,
  ): Promise<MissionaryStaff | null> {
    return this.prisma.missionaryStaff.findFirst({ where });
  }

  async update(
    where: Partial<MissionaryStaff>,
    data: StaffUpdateInput,
  ): Promise<MissionaryStaff> {
    return this.prisma.missionaryStaff.update({
      where: where as { id: string },
      data,
    });
  }

  async delete(where: Partial<MissionaryStaff>): Promise<MissionaryStaff> {
    return this.prisma.missionaryStaff.delete({
      where: where as { id: string },
    });
  }

  async count(where?: Partial<MissionaryStaff>): Promise<number> {
    return this.prisma.missionaryStaff.count({ where });
  }

  async findByMissionaryAndUser(
    missionaryId: string,
    userId: string,
  ): Promise<MissionaryStaff | null> {
    return this.prisma.missionaryStaff.findFirst({
      where: { missionaryId, userId },
    });
  }

  async createWithRelations(
    data: StaffCreateInput,
  ): Promise<StaffWithRelations> {
    return this.prisma.missionaryStaff.create({
      data,
      include: STAFF_INCLUDE,
    });
  }

  async findByMissionary(missionaryId: string): Promise<StaffWithRelations[]> {
    return this.prisma.missionaryStaff.findMany({
      where: { missionaryId },
      include: STAFF_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdWithRelations(id: string): Promise<StaffWithRelations | null> {
    return this.prisma.missionaryStaff.findUnique({
      where: { id },
      include: STAFF_INCLUDE,
    });
  }

  async updateWithRelations(
    id: string,
    data: StaffUpdateInput,
  ): Promise<StaffWithRelations> {
    return this.prisma.missionaryStaff.update({
      where: { id },
      data,
      include: STAFF_INCLUDE,
    });
  }

  async deleteWithRelations(id: string): Promise<StaffWithRelations> {
    return this.prisma.missionaryStaff.delete({
      where: { id },
      include: STAFF_INCLUDE,
    });
  }
}
