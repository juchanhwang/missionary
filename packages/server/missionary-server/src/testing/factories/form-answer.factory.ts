import { randomUUID } from 'crypto';

import type { ParticipationFormAnswer } from '../../../prisma/generated/prisma';

export function makeParticipationFormAnswer(
  overrides: Partial<ParticipationFormAnswer> = {},
): ParticipationFormAnswer {
  return {
    id: randomUUID(),
    value: '',
    participationId: randomUUID(),
    formFieldId: randomUUID(),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: null,
    updatedBy: null,
    version: 0,
    deletedAt: null,
    ...overrides,
  };
}
