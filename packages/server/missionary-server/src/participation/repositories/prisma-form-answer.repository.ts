import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import type {
  FormAnswerRepository,
  FormAnswerUpsertInput,
} from './form-answer-repository.interface';
import type { ParticipationFormAnswer } from '../../../prisma/generated/prisma';

@Injectable()
export class PrismaFormAnswerRepository implements FormAnswerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertMany(
    inputs: FormAnswerUpsertInput[],
  ): Promise<ParticipationFormAnswer[]> {
    return this.prisma.$transaction(
      inputs.map((input) =>
        this.prisma.participationFormAnswer.upsert({
          where: {
            participationId_formFieldId: {
              participationId: input.participationId,
              formFieldId: input.formFieldId,
            },
          },
          create: {
            participationId: input.participationId,
            formFieldId: input.formFieldId,
            value: input.value,
            createdBy: input.updatedBy,
          },
          update: {
            value: input.value,
            updatedBy: input.updatedBy,
            version: { increment: 1 },
          },
        }),
      ),
    );
  }

  async findByParticipation(
    participationId: string,
  ): Promise<ParticipationFormAnswer[]> {
    return this.prisma.participationFormAnswer.findMany({
      where: { participationId },
      include: { formField: true },
    });
  }
}
