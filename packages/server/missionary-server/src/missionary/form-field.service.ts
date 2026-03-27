import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  FORM_FIELD_REPOSITORY,
  type FormFieldRepository,
  type FormFieldUpdateInput,
} from './repositories/form-field-repository.interface';
import {
  MISSIONARY_REPOSITORY,
  type MissionaryRepository,
} from './repositories/missionary-repository.interface';

import type { CreateFormFieldDto } from './dto/create-form-field.dto';
import type { UpdateFormFieldDto } from './dto/update-form-field.dto';
import type { MissionaryFormField } from '../../prisma/generated/prisma';

export type FormFieldWithHasAnswers = MissionaryFormField & {
  hasAnswers: boolean;
};

@Injectable()
export class FormFieldService {
  constructor(
    @Inject(FORM_FIELD_REPOSITORY)
    private readonly repo: FormFieldRepository,
    @Inject(MISSIONARY_REPOSITORY)
    private readonly missionaryRepo: MissionaryRepository,
  ) {}

  async create(missionaryId: string, dto: CreateFormFieldDto, userId: string) {
    const missionary = await this.missionaryRepo.findWithDetails(missionaryId);
    if (!missionary) throw new NotFoundException('Missionary not found');

    if (
      dto.fieldType === 'SELECT' &&
      (!dto.options || dto.options.length === 0)
    ) {
      throw new BadRequestException(
        'SELECT 타입 필드는 options가 1개 이상 필요합니다.',
      );
    }

    const options = dto.fieldType === 'SELECT' ? (dto.options ?? null) : null;

    return this.repo.create({
      missionaryId,
      fieldType: dto.fieldType,
      label: dto.label,
      placeholder: dto.placeholder ?? null,
      isRequired: dto.isRequired,
      order: dto.order,
      options,
      createdBy: userId,
    });
  }

  async findByMissionary(
    missionaryId: string,
  ): Promise<FormFieldWithHasAnswers[]> {
    const fields = await this.repo.findByMissionary(missionaryId);

    if (fields.length === 0) return [];

    const fieldIds = fields.map((f) => f.id);
    const answerCounts = await this.repo.countAnswersByFields(fieldIds);

    return fields.map((f) => ({
      ...f,
      hasAnswers: (answerCounts[f.id] ?? 0) > 0,
    }));
  }

  async update(fieldId: string, dto: UpdateFormFieldDto, userId: string) {
    const field = await this.repo.findById(fieldId);
    if (!field) throw new NotFoundException('Form field not found');

    const updateData: FormFieldUpdateInput = {
      ...dto,
      updatedBy: userId,
    };

    if (dto.options !== undefined) {
      const effectiveType = dto.fieldType ?? field.fieldType;
      updateData.options =
        effectiveType === 'SELECT' ? (dto.options ?? null) : null;
    }

    return this.repo.update(fieldId, updateData);
  }

  async reorder(missionaryId: string, items: { id: string; order: number }[]) {
    const missionary = await this.missionaryRepo.findWithDetails(missionaryId);
    if (!missionary) throw new NotFoundException('Missionary not found');

    await this.repo.reorderBulk(items);

    return { message: `${items.length} field(s) reordered` };
  }

  async remove(fieldId: string) {
    const field = await this.repo.findById(fieldId);
    if (!field) throw new NotFoundException('Form field not found');

    return this.repo.delete(fieldId);
  }
}
