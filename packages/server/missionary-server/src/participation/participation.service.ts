import { InjectQueue } from '@nestjs/bullmq';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Queue } from 'bullmq';

import { EncryptionService } from '@/common/encryption/encryption.service';
import { PrismaService } from '@/database/prisma.service';

import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { Prisma } from '../../prisma/generated/prisma';

import type { Participation } from '../../prisma/generated/prisma';

export interface FindAllFilters {
  missionaryId?: string;
  userId?: string;
  isPaid?: boolean;
}

@Injectable()
export class ParticipationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    @InjectQueue('participation-queue') private readonly queue: Queue,
  ) {}

  private encryptIdentificationNumber(
    identificationNumber: string,
  ): string | undefined {
    if (!identificationNumber) return undefined;
    return this.encryptionService.encrypt(identificationNumber);
  }

  private decryptParticipation(participation: Participation): Participation {
    if (participation.identificationNumber) {
      return {
        ...participation,
        identificationNumber: this.encryptionService.decrypt(
          participation.identificationNumber,
        ),
      };
    }
    return participation;
  }

  private decryptParticipationNullable(
    participation: Participation | null,
  ): Participation | null {
    if (!participation) return null;
    return this.decryptParticipation(participation);
  }

  async create(dto: CreateParticipationDto, userId: string) {
    // Enqueue job to BullMQ for async processing
    const job = await this.queue.add('create-participation', {
      dto,
      userId,
    });

    return {
      jobId: job.id,
      message: 'Participation creation queued',
    };
  }

  async findAll(filters: FindAllFilters = {}) {
    const where: Prisma.ParticipationWhereInput = {};

    if (filters.missionaryId) {
      where.missionaryId = filters.missionaryId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.isPaid !== undefined) {
      where.isPaid = filters.isPaid;
    }

    const participations = await this.prisma.participation.findMany({
      where,
      include: {
        missionary: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return participations.map((p) => this.decryptParticipation(p));
  }

  async findOne(id: string) {
    const participation = await this.prisma.participation.findFirst({
      where: {
        id,
      },
      include: {
        missionary: true,
        user: true,
      },
    });

    if (!participation) {
      throw new NotFoundException(`Participation with ID ${id} not found`);
    }

    return this.decryptParticipation(participation);
  }

  async update(id: string, dto: UpdateParticipationDto, userId: string) {
    const participation = await this.prisma.participation.findFirst({
      where: {
        id,
      },
    });

    if (!participation) {
      throw new NotFoundException(`Participation with ID ${id} not found`);
    }

    if (participation.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own participations',
      );
    }

    const updateData: Prisma.ParticipationUncheckedUpdateInput = {
      ...dto,
      updatedBy: userId,
      version: { increment: 1 },
    };

    if (dto.identificationNumber) {
      updateData.identificationNumber = this.encryptIdentificationNumber(
        dto.identificationNumber,
      );
    }

    const updated = await this.prisma.participation.update({
      where: { id },
      data: updateData,
      include: {
        missionary: true,
        user: true,
      },
    });

    return this.decryptParticipation(updated);
  }

  async remove(id: string, userId: string) {
    const participation = await this.prisma.participation.findFirst({
      where: {
        id,
      },
      include: {
        missionary: true,
        user: true,
      },
    });

    if (!participation) {
      throw new NotFoundException(`Participation with ID ${id} not found`);
    }

    if (participation.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own participations',
      );
    }

    await this.prisma.$transaction([
      this.prisma.participation.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          updatedBy: userId,
        },
      }),
      this.prisma.missionary.update({
        where: { id: participation.missionaryId },
        data: {
          currentParticipantCount: { decrement: 1 },
        },
      }),
    ]);

    return { message: 'Participation deleted successfully' };
  }

  async approvePayments(participationIds: string[]) {
    await this.prisma.participation.updateMany({
      where: {
        id: { in: participationIds },
      },
      data: {
        isPaid: true,
      },
    });

    return {
      message: `${participationIds.length} participation(s) approved`,
    };
  }
}
