import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Queue } from 'bullmq';

import { CsvExportService } from '@/common/csv/csv-export.service';
import { EncryptionService } from '@/common/encryption/encryption.service';
import { UserRole } from '@/common/enums/user-role.enum';
import type { AuthenticatedUser } from '@/common/interfaces/authenticated-user.interface';
import {
  FORM_FIELD_REPOSITORY,
  type FormFieldRepository,
} from '@/missionary/repositories/form-field-repository.interface';
import { TEAM_REPOSITORY, type TeamRepository } from '@/team/repositories';

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
    @Inject(FORM_FIELD_REPOSITORY)
    private readonly formFieldRepository: FormFieldRepository,
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: TeamRepository,
    private readonly encryptionService: EncryptionService,
    private readonly csvExportService: CsvExportService,
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
    const participation = await this.participationRepository.findFirst({
      id,
      deletedAt: null,
    });

    if (!participation) {
      throw new NotFoundException(`Participation with ID ${id} not found`);
    }

    // PRD §2: ADMIN/STAFF는 모든 participation을 수정 가능,
    // 일반 USER는 본인 등록만 수정 가능.
    const isAdminOrStaff =
      user.role === UserRole.ADMIN || user.role === UserRole.STAFF;
    if (!isAdminOrStaff && participation.userId !== user.id) {
      throw new ForbiddenException(
        'You can only update your own participations',
      );
    }

    // §4-B: 팀 배치는 ADMIN/STAFF만 변경할 수 있다.
    // 일반 USER가 본인 등록의 다른 필드를 수정할 수 있도록 컨트롤러 가드 대신
    // 서비스에서 필드별로 분기한다.
    if (dto.teamId !== undefined && !isAdminOrStaff) {
      throw new ForbiddenException(
        '팀 배치는 관리자/스태프만 변경할 수 있습니다',
      );
    }

    // teamId가 지정되면 (1) 팀이 존재하는지 (2) 같은 missionary 소속인지 검증
    if (dto.teamId !== undefined && dto.teamId !== null) {
      const team = await this.teamRepository.findUnique({ id: dto.teamId });
      if (!team) {
        throw new NotFoundException(`Team with ID ${dto.teamId} not found`);
      }
      if (team.missionaryId !== participation.missionaryId) {
        throw new BadRequestException(
          '다른 선교에 속한 팀으로 배치할 수 없습니다',
        );
      }
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

    await this.participationRepository.updateWithRelations(id, updateData);

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
      deletedAt: null,
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

    const validFields = await this.formFieldRepository.findByMissionary(
      participation.missionaryId,
    );
    const validFieldIds = new Set(validFields.map((f) => f.id));
    const invalidIds = dto.answers
      .filter((a) => !validFieldIds.has(a.formFieldId))
      .map((a) => a.formFieldId);

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid formFieldIds: ${invalidIds.join(', ')}`,
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

  async getEnrollmentSummary(missionaryId: string) {
    return this.participationRepository.getEnrollmentSummary(missionaryId);
  }

  async generateCsvBuffer(missionaryId: string): Promise<Buffer> {
    const [result, formFields] = await Promise.all([
      this.findAll({ missionaryId }),
      this.formFieldRepository.findByMissionary(missionaryId),
    ]);

    const rows = result.data.map((p) => ({
      name: p.name,
      birthDate: p.birthDate,
      affiliation: p.affiliation,
      cohort: p.cohort,
      attendanceOptionLabel: p.attendanceOption?.label ?? null,
      applyFee: p.applyFee,
      isPaid: p.isPaid,
      isOwnCar: p.isOwnCar,
      hasPastParticipation: p.hasPastParticipation,
      isCollegeStudent: p.isCollegeStudent,
      teamName: p.team?.teamName ?? null,
      createdAt: p.createdAt,
      formAnswers: p.formAnswers,
    }));

    return this.csvExportService.generateParticipationCsv(rows, formFields);
  }
}
