import { InjectQueue } from '@nestjs/bullmq';
import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Queue } from 'bullmq';

import { EncryptionService } from '@/common/encryption/encryption.service';

import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import {
  PARTICIPATION_REPOSITORY,
  type FindAllFilters,
  type ParticipationRepository,
  type ParticipationUpdateInput,
} from './repositories/participation-repository.interface';

import type { Participation } from '../../prisma/generated/prisma';

export type { FindAllFilters } from './repositories/participation-repository.interface';

@Injectable()
export class ParticipationService {
  constructor(
    @Inject(PARTICIPATION_REPOSITORY)
    private readonly participationRepository: ParticipationRepository,
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
    const participations =
      await this.participationRepository.findAllFiltered(filters);

    return participations.map((p) => this.decryptParticipation(p));
  }

  async findOne(id: string) {
    const participation =
      await this.participationRepository.findOneWithRelations(id);

    if (!participation) {
      throw new NotFoundException(`Participation with ID ${id} not found`);
    }

    return this.decryptParticipation(participation);
  }

  async update(id: string, dto: UpdateParticipationDto, userId: string) {
    const participation = await this.participationRepository.findFirst({ id });

    if (!participation) {
      throw new NotFoundException(`Participation with ID ${id} not found`);
    }

    if (participation.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own participations',
      );
    }

    const updateData: ParticipationUpdateInput = {
      ...dto,
      updatedBy: userId,
      version: { increment: 1 },
    };

    if (dto.identificationNumber) {
      updateData.identificationNumber = this.encryptIdentificationNumber(
        dto.identificationNumber,
      );
    }

    const updated = await this.participationRepository.updateWithRelations(
      id,
      updateData,
    );

    return this.decryptParticipation(updated);
  }

  async remove(id: string, userId: string) {
    const participation =
      await this.participationRepository.findOneWithRelations(id);

    if (!participation) {
      throw new NotFoundException(`Participation with ID ${id} not found`);
    }

    if (participation.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own participations',
      );
    }

    await this.participationRepository.softDeleteWithCountDecrement(
      id,
      userId,
      participation.missionaryId,
    );

    return { message: 'Participation deleted successfully' };
  }

  async approvePayments(participationIds: string[]) {
    await this.participationRepository.approvePayments(participationIds);

    return {
      message: `${participationIds.length} participation(s) approved`,
    };
  }
}
