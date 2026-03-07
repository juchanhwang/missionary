import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { STAFF_REPOSITORY } from './repositories';

import type { StaffRepository, StaffUpdateInput } from './repositories';

@Injectable()
export class StaffService {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepository: StaffRepository,
  ) {}

  async create(dto: CreateStaffDto) {
    // Check unique constraint: missionaryId + userId
    const existing = await this.staffRepository.findByMissionaryAndUser(
      dto.missionaryId,
      dto.userId,
    );

    if (existing) {
      throw new ConflictException('User already assigned to this missionary');
    }

    return this.staffRepository.createWithRelations({
      missionaryId: dto.missionaryId,
      userId: dto.userId,
      role: dto.role,
    });
  }

  async findByMissionary(missionaryId: string) {
    return this.staffRepository.findByMissionary(missionaryId);
  }

  async findOne(id: string) {
    const staff = await this.staffRepository.findByIdWithRelations(id);

    if (!staff) {
      throw new NotFoundException(`Staff assignment with ID ${id} not found`);
    }

    return staff;
  }

  async update(id: string, dto: UpdateStaffDto) {
    await this.findOne(id);

    const data: StaffUpdateInput = {};

    if (dto.role !== undefined) data.role = dto.role;

    return this.staffRepository.updateWithRelations(id, data);
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.staffRepository.deleteWithRelations(id);
  }
}
