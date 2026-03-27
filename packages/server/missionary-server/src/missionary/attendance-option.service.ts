import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ATTENDANCE_OPTION_REPOSITORY,
  type AttendanceOptionRepository,
} from './repositories/attendance-option-repository.interface';
import {
  MISSIONARY_REPOSITORY,
  type MissionaryRepository,
} from './repositories/missionary-repository.interface';

import type { CreateAttendanceOptionDto } from './dto/create-attendance-option.dto';
import type { UpdateAttendanceOptionDto } from './dto/update-attendance-option.dto';

@Injectable()
export class AttendanceOptionService {
  constructor(
    @Inject(ATTENDANCE_OPTION_REPOSITORY)
    private readonly repo: AttendanceOptionRepository,
    @Inject(MISSIONARY_REPOSITORY)
    private readonly missionaryRepo: MissionaryRepository,
  ) {}

  async create(
    missionaryId: string,
    dto: CreateAttendanceOptionDto,
    userId: string,
  ) {
    const missionary = await this.missionaryRepo.findWithDetails(missionaryId);
    if (!missionary) throw new NotFoundException('Missionary not found');

    return this.repo.create({
      missionaryId,
      type: dto.type,
      label: dto.label,
      order: dto.order,
      createdBy: userId,
    });
  }

  async findByMissionary(missionaryId: string) {
    return this.repo.findByMissionary(missionaryId);
  }

  async update(
    optionId: string,
    dto: UpdateAttendanceOptionDto,
    userId: string,
  ) {
    const option = await this.repo.findById(optionId);
    if (!option) throw new NotFoundException('Attendance option not found');

    return this.repo.update(optionId, { ...dto, updatedBy: userId });
  }

  async remove(optionId: string) {
    const option = await this.repo.findById(optionId);
    if (!option) throw new NotFoundException('Attendance option not found');

    const count = await this.repo.countParticipationsByOption(optionId);
    if (count > 0) {
      throw new BadRequestException(
        `${count}명이 선택한 옵션은 삭제할 수 없습니다.`,
      );
    }

    return this.repo.delete(optionId);
  }
}
