import { InjectQueue } from '@nestjs/bullmq';
import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Queue } from 'bullmq';

import { EncryptionService } from '@/common/encryption/encryption.service';
import { UserRole } from '@/common/enums/user-role.enum';
import type { AuthenticatedUser } from '@/common/interfaces/authenticated-user.interface';

import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import {
  FORM_ANSWER_REPOSITORY,
  type FormAnswerRepository,
} from './repositories/form-answer-repository.interface';
import {
  PARTICIPATION_REPOSITORY,
  type FindAllFilters,
  type FindAllResult,
  type ParticipationRepository,
  type ParticipationUpdateInput,
} from './repositories/participation-repository.interface';

import type { UpdateFormAnswersDto } from './dto/update-form-answers.dto';
import type { Participation } from '../../prisma/generated/prisma';

export type { FindAllFilters } from './repositories/participation-repository.interface';

@Injectable()
export class ParticipationService {
  constructor(
    @Inject(PARTICIPATION_REPOSITORY)
    private readonly participationRepository: ParticipationRepository,
    @Inject(FORM_ANSWER_REPOSITORY)
    private readonly formAnswerRepository: FormAnswerRepository,
    private readonly encryptionService: EncryptionService,
    @InjectQueue('participation-queue') private readonly queue: Queue,
  ) {}

  private encryptIdentificationNumber(
    identificationNumber: string,
  ): string | undefined {
    if (!identificationNumber) return undefined;
    return this.encryptionService.encrypt(identificationNumber);
  }

  private decryptParticipation<T extends Participation>(participation: T): T {
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

  async create(dto: CreateParticipationDto, userId: string) {
    const job = await this.queue.add('create-participation', {
      dto,
      userId,
    });

    return {
      jobId: job.id,
      message: 'Participation creation queued',
    };
  }

  async findAll(filters: FindAllFilters = {}): Promise<FindAllResult> {
    const result = await this.participationRepository.findAllFiltered(filters);

    return {
      data: result.data.map((p) => this.decryptParticipation(p)),
      total: result.total,
    };
  }

  async findOne(id: string) {
    const participation =
      await this.participationRepository.findOneWithRelations(id);

    if (!participation) {
      throw new NotFoundException(`Participation with ID ${id} not found`);
    }

    return this.decryptParticipation(participation);
  }

  async update(
    id: string,
    dto: UpdateParticipationDto,
    user: AuthenticatedUser,
  ) {
    const participation = await this.participationRepository.findFirst({ id });

    if (!participation) {
      throw new NotFoundException(`Participation with ID ${id} not found`);
    }

    if (user.role !== UserRole.ADMIN && participation.userId !== user.id) {
      throw new ForbiddenException(
        'You can only update your own participations',
      );
    }

    const { answers, ...fixedFields } = dto;

    const updateData: ParticipationUpdateInput = {
      ...fixedFields,
      updatedBy: user.id,
      version: { increment: 1 },
    };

    if (fixedFields.identificationNumber) {
      updateData.identificationNumber = this.encryptIdentificationNumber(
        fixedFields.identificationNumber,
      );
    }

    const updated = await this.participationRepository.updateWithRelations(
      id,
      updateData,
    );

    if (answers && answers.length > 0) {
      await this.formAnswerRepository.upsertMany(
        answers.map((a) => ({
          participationId: id,
          formFieldId: a.formFieldId,
          value: a.value,
          updatedBy: user.id,
        })),
      );
    }

    return this.findOne(id);
  }

  async remove(id: string, user: AuthenticatedUser) {
    const participation =
      await this.participationRepository.findOneWithRelations(id);

    if (!participation) {
      throw new NotFoundException(`Participation with ID ${id} not found`);
    }

    if (user.role !== UserRole.ADMIN && participation.userId !== user.id) {
      throw new ForbiddenException(
        'You can only delete your own participations',
      );
    }

    await this.participationRepository.softDeleteWithCountDecrement(
      id,
      user.id,
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

  async updateAnswers(
    participationId: string,
    dto: UpdateFormAnswersDto,
    user: AuthenticatedUser,
  ) {
    const participation = await this.participationRepository.findFirst({
      id: participationId,
    });

    if (!participation) {
      throw new NotFoundException(
        `Participation with ID ${participationId} not found`,
      );
    }

    if (user.role !== UserRole.ADMIN && participation.userId !== user.id) {
      throw new ForbiddenException(
        'You can only update your own participations',
      );
    }

    const inputs = dto.answers.map((a) => ({
      participationId,
      formFieldId: a.formFieldId,
      value: a.value,
      updatedBy: user.id,
    }));

    return this.formAnswerRepository.upsertMany(inputs);
  }
}
