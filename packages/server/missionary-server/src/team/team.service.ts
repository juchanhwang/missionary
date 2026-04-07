import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  MISSIONARY_REGION_REPOSITORY,
  type MissionaryRegionRepository,
} from '@/missionary/repositories/missionary-region-repository.interface';
import {
  MISSIONARY_REPOSITORY,
  type MissionaryRepository,
} from '@/missionary/repositories/missionary-repository.interface';

import { AddMembersDto } from './dto/add-members.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TEAM_REPOSITORY } from './repositories';

import type { TeamRepository, TeamUpdateInput } from './repositories';

@Injectable()
export class TeamService {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: TeamRepository,
    @Inject(MISSIONARY_REPOSITORY)
    private readonly missionaryRepository: MissionaryRepository,
    @Inject(MISSIONARY_REGION_REPOSITORY)
    private readonly missionaryRegionRepository: MissionaryRegionRepository,
  ) {}

  async create(dto: CreateTeamDto) {
    // OQ-A: missionaryRegionId가 입력되면 해당 region이 같은 missionGroup에 속하는지 검증
    if (dto.missionaryRegionId) {
      await this.validateRegionMissionGroup(
        dto.missionaryId,
        dto.missionaryRegionId,
      );
    }

    return this.teamRepository.createWithRelations({
      missionaryId: dto.missionaryId,
      churchId: dto.churchId,
      leaderUserId: dto.leaderUserId,
      leaderUserName: dto.leaderUserName,
      teamName: dto.teamName,
      missionaryRegionId: dto.missionaryRegionId,
    });
  }

  async findAll(missionaryId?: string) {
    return this.teamRepository.findAll(missionaryId);
  }

  async findOne(id: string) {
    const team = await this.teamRepository.findWithMembers(id);

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  async update(id: string, dto: UpdateTeamDto) {
    const existing = await this.findOne(id);

    // OQ-A: missionaryRegionId가 새로 연결되는 경우(빈 값/disconnect 제외) 검증
    if (dto.missionaryRegionId) {
      // dto.missionaryId가 함께 변경되면 새 값을, 아니면 기존 값을 사용
      const targetMissionaryId = dto.missionaryId ?? existing.missionaryId;
      await this.validateRegionMissionGroup(
        targetMissionaryId,
        dto.missionaryRegionId,
      );
    }

    const data: TeamUpdateInput = {};

    if (dto.missionaryId !== undefined) {
      data.missionary = { connect: { id: dto.missionaryId } };
    }
    if (dto.churchId !== undefined) {
      data.church = dto.churchId
        ? { connect: { id: dto.churchId } }
        : { disconnect: true };
    }
    if (dto.missionaryRegionId !== undefined) {
      data.missionaryRegion = dto.missionaryRegionId
        ? { connect: { id: dto.missionaryRegionId } }
        : { disconnect: true };
    }
    if (dto.leaderUserId !== undefined) data.leaderUserId = dto.leaderUserId;
    if (dto.leaderUserName !== undefined)
      data.leaderUserName = dto.leaderUserName;
    if (dto.teamName !== undefined) data.teamName = dto.teamName;

    return this.teamRepository.updateWithRelations(id, data);
  }

  async remove(id: string) {
    await this.findOne(id);

    // OQ-2: 팀 삭제 시 참가자 teamId를 명시적으로 NULL 처리한 뒤 hard delete.
    // FK는 ON DELETE SET NULL이지만, 의도를 코드에 드러내기 위해 트랜잭션으로 감싼다.
    return this.teamRepository.deleteWithDetachParticipants(id);
  }

  async addMembers(teamId: string, dto: AddMembersDto) {
    await this.findOne(teamId);

    await this.teamRepository.addMembers(teamId, dto.userIds);

    return this.findOne(teamId);
  }

  async removeMembers(teamId: string, dto: AddMembersDto) {
    await this.findOne(teamId);

    await this.teamRepository.softDeleteMembers(teamId, dto.userIds);

    return this.findOne(teamId);
  }

  /**
   * OQ-A: missionary가 속한 missionGroup과 region의 missionGroupId가 일치하는지 검증.
   *
   * - missionary가 존재하지 않으면 NotFoundException
   * - missionary에 missionGroupId가 지정되지 않은 경우 BadRequestException
   * - region이 다른 missionGroup에 속하면 BadRequestException
   */
  private async validateRegionMissionGroup(
    missionaryId: string,
    missionaryRegionId: string,
  ): Promise<void> {
    const missionary =
      await this.missionaryRepository.findWithDetails(missionaryId);
    if (!missionary) {
      throw new NotFoundException(
        `Missionary with ID ${missionaryId} not found`,
      );
    }
    if (!missionary.missionGroupId) {
      throw new BadRequestException(
        '선교 그룹이 지정되지 않은 선교에는 연계지를 연결할 수 없습니다',
      );
    }

    const region =
      await this.missionaryRegionRepository.findByIdAndMissionGroup(
        missionaryRegionId,
        missionary.missionGroupId,
      );
    if (!region) {
      throw new BadRequestException(
        '연계지가 해당 선교 그룹에 속하지 않습니다',
      );
    }
  }
}
