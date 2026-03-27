import type { ParticipationFormAnswer } from '../../../prisma/generated/prisma';

export interface FormAnswerUpsertInput {
  participationId: string;
  formFieldId: string;
  value: string;
  updatedBy?: string;
}

export interface FormAnswerRepository {
  upsertMany(
    inputs: FormAnswerUpsertInput[],
  ): Promise<ParticipationFormAnswer[]>;
  findByParticipation(
    participationId: string,
  ): Promise<ParticipationFormAnswer[]>;
}

export const FORM_ANSWER_REPOSITORY = Symbol('FORM_ANSWER_REPOSITORY');
