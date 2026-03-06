import { Inject, Injectable, NotFoundException } from '@nestjs/common';

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
  ) {}

  async create(dto: CreateTeamDto) {
    return this.teamRepository.createWithRelations({
      missionaryId: dto.missionaryId,
      churchId: dto.churchId,
      leaderUserId: dto.leaderUserId,
      leaderUserName: dto.leaderUserName,
      teamName: dto.teamName,
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
    await this.findOne(id);

    const data: TeamUpdateInput = {};

    if (dto.missionaryId !== undefined) {
      data.missionary = { connect: { id: dto.missionaryId } };
    }
    if (dto.churchId !== undefined) {
      data.church = dto.churchId
        ? { connect: { id: dto.churchId } }
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

    return this.teamRepository.delete({ id });
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
}
