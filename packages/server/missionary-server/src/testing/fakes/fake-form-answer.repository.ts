import { randomUUID } from 'crypto';

import type {
  FormAnswerRepository,
  FormAnswerUpsertInput,
} from '@/participation/repositories/form-answer-repository.interface';

import type { ParticipationFormAnswer } from '../../../prisma/generated/prisma';

export class FakeFormAnswerRepository implements FormAnswerRepository {
  private store = new Map<string, ParticipationFormAnswer>();

  async upsertMany(
    inputs: FormAnswerUpsertInput[],
  ): Promise<ParticipationFormAnswer[]> {
    const results: ParticipationFormAnswer[] = [];

    for (const input of inputs) {
      const existing = [...this.store.values()].find(
        (a) =>
          a.participationId === input.participationId &&
          a.formFieldId === input.formFieldId,
      );

      if (existing) {
        const updated = {
          ...existing,
          value: input.value,
          updatedAt: new Date(),
          updatedBy: input.updatedBy ?? null,
        };
        this.store.set(existing.id, updated);
        results.push(updated);
      } else {
        const now = new Date();
        const entity: ParticipationFormAnswer = {
          id: randomUUID(),
          value: input.value,
          participationId: input.participationId,
          formFieldId: input.formFieldId,
          createdAt: now,
          updatedAt: now,
          createdBy: input.updatedBy ?? null,
          updatedBy: null,
          version: 0,
          deletedAt: null,
        };
        this.store.set(entity.id, entity);
        results.push(entity);
      }
    }

    return results;
  }

  async findByParticipation(
    participationId: string,
  ): Promise<ParticipationFormAnswer[]> {
    return [...this.store.values()].filter(
      (a) => a.participationId === participationId && a.deletedAt === null,
    );
  }

  clear(): void {
    this.store.clear();
  }
}
