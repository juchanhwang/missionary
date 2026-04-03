import { Processor, WorkerHost } from '@nestjs/bullmq';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Job } from 'bullmq';

import { EncryptionService } from '@/common/encryption/encryption.service';
import {
  ATTENDANCE_OPTION_REPOSITORY,
  type AttendanceOptionRepository,
} from '@/missionary/repositories/attendance-option-repository.interface';
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
    @Inject(ATTENDANCE_OPTION_REPOSITORY)
    private readonly attendanceOptionRepository: AttendanceOptionRepository,
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
      throw new NotFoundException('Missionary not found');
    }

    if (!missionary.isAcceptingResponses) {
      throw new ConflictException('Missionary is not accepting responses');
    }

    if (
      missionary.maximumParticipantCount !== null &&
      missionary.currentParticipantCount >= missionary.maximumParticipantCount
    ) {
      throw new ConflictException('Missionary is at full capacity');
    }

    // TRAP-4: attendanceOptionId cross-validation
    const attendanceOption = await this.attendanceOptionRepository.findById(
      dto.attendanceOptionId,
    );
    if (
      !attendanceOption ||
      attendanceOption.missionaryId !== dto.missionaryId
    ) {
      throw new BadRequestException(
        `Attendance option ${dto.attendanceOptionId} does not belong to missionary ${dto.missionaryId}`,
      );
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
        affiliation: dto.affiliation,
        attendanceOptionId: dto.attendanceOptionId,
        cohort: dto.cohort,
        hasPastParticipation: dto.hasPastParticipation ?? null,
        isCollegeStudent: dto.isCollegeStudent ?? null,
      },
      dto.missionaryId,
    );

    // Auto-close enrollment when capacity is reached
    const newCount = missionary.currentParticipantCount + 1;
    if (
      missionary.maximumParticipantCount !== null &&
      newCount >= missionary.maximumParticipantCount &&
      missionary.status !== 'ENROLLMENT_CLOSED'
    ) {
      await this.missionaryRepository.update(dto.missionaryId, {
        status: 'ENROLLMENT_CLOSED',
      });
      this.logger.log(
        `Missionary ${dto.missionaryId} enrollment auto-closed: capacity reached (${newCount}/${missionary.maximumParticipantCount})`,
      );
    }

    this.logger.log(
      `Successfully created participation ${result.id} for missionary ${dto.missionaryId}`,
    );

    return result;
  }
}
