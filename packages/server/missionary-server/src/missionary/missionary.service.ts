import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  MISSION_GROUP_REPOSITORY,
  type MissionGroupRepository,
} from '@/mission-group/repositories/mission-group-repository.interface';

import { CreateMissionaryPosterDto } from './dto/create-missionary-poster.dto';
import { CreateMissionaryRegionDto } from './dto/create-missionary-region.dto';
import { CreateMissionaryDto } from './dto/create-missionary.dto';
import { UpdateMissionaryDto } from './dto/update-missionary.dto';
import {
  calculateNextOrder,
  generateMissionaryName,
  shouldAutoFillName,
} from './missionary.utils';
import {
  MISSIONARY_POSTER_REPOSITORY,
  type MissionaryPosterRepository,
} from './repositories/missionary-poster-repository.interface';
import {
  MISSIONARY_REGION_REPOSITORY,
  type MissionaryRegionRepository,
} from './repositories/missionary-region-repository.interface';
import {
  MISSIONARY_REPOSITORY,
  type MissionaryRepository,
} from './repositories/missionary-repository.interface';

@Injectable()
export class MissionaryService {
  constructor(
    @Inject(MISSIONARY_REPOSITORY)
    private readonly missionaryRepository: MissionaryRepository,
    @Inject(MISSIONARY_REGION_REPOSITORY)
    private readonly missionaryRegionRepository: MissionaryRegionRepository,
    @Inject(MISSIONARY_POSTER_REPOSITORY)
    private readonly missionaryPosterRepository: MissionaryPosterRepository,
    @Inject(MISSION_GROUP_REPOSITORY)
    private readonly missionGroupRepository: MissionGroupRepository,
  ) {}

  async create(userId: string, dto: CreateMissionaryDto) {
    let finalOrder = dto.order;
    let finalName = dto.name;

    if (dto.missionGroupId) {
      // Verify MissionGroup exists
      const group = await this.missionGroupRepository.findById(
        dto.missionGroupId,
      );

      if (!group) {
        throw new NotFoundException(
          `MissionGroup with ID ${dto.missionGroupId} not found`,
        );
      }

      // Auto-increment order if not provided
      if (finalOrder === undefined || finalOrder === null) {
        const maxOrder = await this.missionaryRepository.getMaxOrder(
          dto.missionGroupId,
        );
        finalOrder = calculateNextOrder(maxOrder);
      }

      // Auto-fill name if empty
      if (shouldAutoFillName(finalName)) {
        finalName = generateMissionaryName(finalOrder, group.name);
      }
    }

    return this.missionaryRepository.create({
      name: finalName,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      pastorName: dto.pastorName,
      pastorPhone: dto.pastorPhone,
      participationStartDate: dto.participationStartDate
        ? new Date(dto.participationStartDate)
        : null,
      participationEndDate: dto.participationEndDate
        ? new Date(dto.participationEndDate)
        : null,
      price: dto.price,
      description: dto.description,
      maximumParticipantCount: dto.maximumParticipantCount,
      bankName: dto.bankName,
      bankAccountHolder: dto.bankAccountHolder,
      bankAccountNumber: dto.bankAccountNumber,
      missionGroupId: dto.missionGroupId,
      order: finalOrder,
      createdById: userId,
      status: dto.status,
    });
  }

  async findAll() {
    return this.missionaryRepository.findAll();
  }

  async findOne(id: string) {
    const missionary = await this.missionaryRepository.findWithDetails(id);

    if (!missionary) {
      throw new NotFoundException(`Missionary with ID ${id} not found`);
    }

    return missionary;
  }

  async update(id: string, dto: UpdateMissionaryDto) {
    await this.findOne(id);

    const data: Record<string, unknown> = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = new Date(dto.endDate);
    if (dto.pastorName !== undefined) data.pastorName = dto.pastorName;
    if (dto.pastorPhone !== undefined) data.pastorPhone = dto.pastorPhone;
    if (dto.participationStartDate !== undefined)
      data.participationStartDate = new Date(dto.participationStartDate);
    if (dto.participationEndDate !== undefined)
      data.participationEndDate = new Date(dto.participationEndDate);
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.maximumParticipantCount !== undefined)
      data.maximumParticipantCount = dto.maximumParticipantCount;
    if (dto.bankName !== undefined) data.bankName = dto.bankName;
    if (dto.bankAccountHolder !== undefined)
      data.bankAccountHolder = dto.bankAccountHolder;
    if (dto.bankAccountNumber !== undefined)
      data.bankAccountNumber = dto.bankAccountNumber;
    if (dto.status !== undefined) data.status = dto.status;

    return this.missionaryRepository.update(id, data);
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.missionaryRepository.delete(id);
  }

  async addRegion(missionaryId: string, dto: CreateMissionaryRegionDto) {
    await this.findOne(missionaryId);

    return this.missionaryRegionRepository.create({
      missionaryId,
      name: dto.name,
      visitPurpose: dto.visitPurpose,
      pastorName: dto.pastorName,
      pastorPhone: dto.pastorPhone,
      addressBasic: dto.addressBasic,
      addressDetail: dto.addressDetail,
    });
  }

  async getRegions(missionaryId: string) {
    await this.findOne(missionaryId);

    return this.missionaryRegionRepository.findByMissionary(missionaryId);
  }

  async removeRegion(missionaryId: string, regionId: string) {
    await this.findOne(missionaryId);

    const region = await this.missionaryRegionRepository.findByIdAndMissionary(
      regionId,
      missionaryId,
    );

    if (!region) {
      throw new NotFoundException(
        `MissionaryRegion with ID ${regionId} not found for missionary ${missionaryId}`,
      );
    }

    return this.missionaryRegionRepository.delete(regionId);
  }

  async addPoster(missionaryId: string, dto: CreateMissionaryPosterDto) {
    await this.findOne(missionaryId);

    return this.missionaryPosterRepository.create({
      missionaryId,
      name: dto.name,
      path: dto.path,
    });
  }

  async getPosters(missionaryId: string) {
    await this.findOne(missionaryId);

    return this.missionaryPosterRepository.findByMissionary(missionaryId);
  }

  async removePoster(missionaryId: string, posterId: string) {
    await this.findOne(missionaryId);

    const poster = await this.missionaryPosterRepository.findByIdAndMissionary(
      posterId,
      missionaryId,
    );

    if (!poster) {
      throw new NotFoundException(
        `MissionaryPoster with ID ${posterId} not found for missionary ${missionaryId}`,
      );
    }

    return this.missionaryPosterRepository.delete(posterId);
  }
}
