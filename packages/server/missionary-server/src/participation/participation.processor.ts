import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { EncryptionService } from '@/common/encryption/encryption.service';
import {
  MISSIONARY_REPOSITORY,
  type MissionaryRepository,
} from '@/missionary/repositories/missionary-repository.interface';

import {
  PARTICIPATION_REPOSITORY,
  type ParticipationRepository,
} from './repositories/participation-repository.interface';

import type { CreateParticipationDto } from './dto/create-participation.dto';

@Processor('participation-queue')
@Injectable()
export class ParticipationProcessor extends WorkerHost {
  private readonly logger = new Logger(ParticipationProcessor.name);

  constructor(
    @Inject(PARTICIPATION_REPOSITORY)
    private readonly participationRepository: ParticipationRepository,
    @Inject(MISSIONARY_REPOSITORY)
    private readonly missionaryRepository: MissionaryRepository,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
  }

  async process(job: Job<{ dto: CreateParticipationDto; userId: string }>) {
    const { dto, userId } = job.data;

    this.logger.log(
      `Processing participation creation for user ${userId}, missionary ${dto.missionaryId}`,
    );

    const missionary = await this.missionaryRepository.findWithDetails(
      dto.missionaryId,
    );

    if (!missionary) {
      throw new ConflictException('Missionary not found');
    }

    if (
      missionary.maximumParticipantCount !== null &&
      missionary.currentParticipantCount >= missionary.maximumParticipantCount
    ) {
      throw new ConflictException('Missionary is at full capacity');
    }

    const encryptedIdentificationNumber = this.encryptionService.encrypt(
      dto.identificationNumber,
    );

    const result = await this.participationRepository.createAndIncrementCount(
      {
        name: dto.name,
        birthDate: dto.birthDate,
        applyFee: dto.applyFee,
        identificationNumber: encryptedIdentificationNumber,
        isOwnCar: dto.isOwnCar,
        missionaryId: dto.missionaryId,
        userId,
        createdBy: userId,
      },
      dto.missionaryId,
    );

    this.logger.log(
      `Successfully created participation ${result.id} for missionary ${dto.missionaryId}`,
    );

    return result;
  }
}
