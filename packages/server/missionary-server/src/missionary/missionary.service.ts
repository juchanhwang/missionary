import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import { CreateMissionaryRegionDto } from './dto/create-missionary-region.dto';
import { CreateMissionaryPosterDto } from './dto/create-missionary-poster.dto';
import { CreateMissionaryDto } from './dto/create-missionary.dto';
import { UpdateMissionaryDto } from './dto/update-missionary.dto';
import { Prisma } from '../../prisma/generated/prisma';

@Injectable()
export class MissionaryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateMissionaryDto) {
    let finalOrder = dto.order;
    let finalName = dto.name;

    if (dto.missionGroupId) {
      // Verify MissionGroup exists
      const group = await this.prisma.missionGroup.findUnique({
        where: { id: dto.missionGroupId },
      });

      if (!group) {
        throw new NotFoundException(
          `MissionGroup with ID ${dto.missionGroupId} not found`,
        );
      }

      // Auto-increment order if not provided
      if (finalOrder === undefined || finalOrder === null) {
        const maxOrder = await this.prisma.missionary.aggregate({
          where: {
            missionGroupId: dto.missionGroupId,
          },
          _max: {
            order: true,
          },
        });
        finalOrder = (maxOrder._max.order ?? 0) + 1;
      }

      // Auto-fill name if empty
      if (!finalName || finalName.trim() === '') {
        finalName = `${finalOrder}차 ${group.name}`;
      }
    }

    return this.prisma.missionary.create({
      data: {
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
      },
      include: {
        missionGroup: true,
      },
    });
  }

  async findAll() {
    return this.prisma.missionary.findMany({
      include: {
        missionGroup: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const missionary = await this.prisma.missionary.findUnique({
      where: { id },
      include: {
        missionGroup: true,
        posters: true,
        regions: true,
      },
    });

    if (!missionary) {
      throw new NotFoundException(`Missionary with ID ${id} not found`);
    }

    return missionary;
  }

  async update(id: string, dto: UpdateMissionaryDto) {
    await this.findOne(id);

    const data: Prisma.MissionaryUncheckedUpdateInput = {};

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

    return this.prisma.missionary.update({
      where: { id },
      data,
      include: {
        missionGroup: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.missionary.delete({
      where: { id },
    });
  }

  async addRegion(missionaryId: string, dto: CreateMissionaryRegionDto) {
    await this.findOne(missionaryId);

    return this.prisma.missionaryRegion.create({
      data: {
        missionaryId,
        name: dto.name,
        visitPurpose: dto.visitPurpose,
        pastorName: dto.pastorName,
        pastorPhone: dto.pastorPhone,
        addressBasic: dto.addressBasic,
        addressDetail: dto.addressDetail,
      },
    });
  }

  async getRegions(missionaryId: string) {
    await this.findOne(missionaryId);

    return this.prisma.missionaryRegion.findMany({
      where: { missionaryId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async removeRegion(missionaryId: string, regionId: string) {
    await this.findOne(missionaryId);

    const region = await this.prisma.missionaryRegion.findFirst({
      where: {
        id: regionId,
        missionaryId,
      },
    });

    if (!region) {
      throw new NotFoundException(
        `MissionaryRegion with ID ${regionId} not found for missionary ${missionaryId}`,
      );
    }

    return this.prisma.missionaryRegion.delete({
      where: { id: regionId },
    });
  }

  async addPoster(missionaryId: string, dto: CreateMissionaryPosterDto) {
    await this.findOne(missionaryId);

    return this.prisma.missionaryPoster.create({
      data: {
        missionaryId,
        name: dto.name,
        path: dto.path,
      },
    });
  }

  async getPosters(missionaryId: string) {
    await this.findOne(missionaryId);

    return this.prisma.missionaryPoster.findMany({
      where: { missionaryId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async removePoster(missionaryId: string, posterId: string) {
    await this.findOne(missionaryId);

    const poster = await this.prisma.missionaryPoster.findFirst({
      where: {
        id: posterId,
        missionaryId,
      },
    });

    if (!poster) {
      throw new NotFoundException(
        `MissionaryPoster with ID ${posterId} not found for missionary ${missionaryId}`,
      );
    }

    return this.prisma.missionaryPoster.delete({
      where: { id: posterId },
    });
  }
}
