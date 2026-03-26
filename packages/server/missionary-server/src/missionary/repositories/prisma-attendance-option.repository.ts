import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import type {
  AttendanceOptionCreateInput,
  AttendanceOptionRepository,
  AttendanceOptionUpdateInput,
} from './attendance-option-repository.interface';
import type { MissionaryAttendanceOption } from '../../../prisma/generated/prisma';

@Injectable()
export class PrismaAttendanceOptionRepository implements AttendanceOptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: AttendanceOptionCreateInput,
  ): Promise<MissionaryAttendanceOption> {
    return this.prisma.missionaryAttendanceOption.create({ data });
  }

  async findByMissionary(
    missionaryId: string,
  ): Promise<MissionaryAttendanceOption[]> {
    return this.prisma.missionaryAttendanceOption.findMany({
      where: { missionaryId },
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: string): Promise<MissionaryAttendanceOption | null> {
    return this.prisma.missionaryAttendanceOption.findFirst({
      where: { id },
    });
  }

  async update(
    id: string,
    data: AttendanceOptionUpdateInput,
  ): Promise<MissionaryAttendanceOption> {
    return this.prisma.missionaryAttendanceOption.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    });
  }

  async delete(id: string): Promise<MissionaryAttendanceOption> {
    return this.prisma.missionaryAttendanceOption.delete({
      where: { id },
    });
  }

  async countParticipationsByOption(optionId: string): Promise<number> {
    return this.prisma.participation.count({
      where: { attendanceOptionId: optionId, deletedAt: null },
    });
  }
}
