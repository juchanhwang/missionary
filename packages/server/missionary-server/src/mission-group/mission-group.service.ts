import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  MISSIONARY_REPOSITORY,
  type MissionaryRepository,
} from '@/missionary/repositories/missionary-repository.interface';

import { CreateMissionGroupDto } from './dto/create-mission-group.dto';
import { UpdateMissionGroupDto } from './dto/update-mission-group.dto';
import {
  MISSION_GROUP_REPOSITORY,
  type MissionGroupRepository,
} from './repositories/mission-group-repository.interface';

@Injectable()
export class MissionGroupService {
  constructor(
    @Inject(MISSION_GROUP_REPOSITORY)
    private readonly missionGroupRepository: MissionGroupRepository,
    @Inject(MISSIONARY_REPOSITORY)
    private readonly missionaryRepository: MissionaryRepository,
  ) {}

  async create(createMissionGroupDto: CreateMissionGroupDto) {
    return this.missionGroupRepository.create(createMissionGroupDto);
  }

  async findAll() {
    return this.missionGroupRepository.findAllWithCount();
  }

  async findOne(id: string) {
    const group = await this.missionGroupRepository.findWithMissionaries(id);

    if (!group) {
      throw new NotFoundException(`MissionGroup #${id}을 찾을 수 없습니다`);
    }

    return group;
  }

  async update(id: string, updateMissionGroupDto: UpdateMissionGroupDto) {
    await this.findOne(id); // Verify exists

    return this.missionGroupRepository.update(id, updateMissionGroupDto);
  }

  async remove(id: string) {
    await this.findOne(id); // Verify exists

    // Check for existing missionaries
    const missionaryCount = await this.missionaryRepository.count({
      missionGroupId: id,
    });

    if (missionaryCount > 0) {
      throw new ConflictException(
        `Cannot delete mission group with ${missionaryCount} existing missionaries`,
      );
    }

    return this.missionGroupRepository.delete(id);
  }
}
