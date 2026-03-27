import { randomUUID } from 'crypto';

import type { MissionaryFormField } from '../../../prisma/generated/prisma';

export function makeMissionaryFormField(
  overrides: Partial<MissionaryFormField> = {},
): MissionaryFormField {
  return {
    id: randomUUID(),
    fieldType: 'TEXT',
    label: '테스트필드',
    placeholder: null,
    isRequired: false,
    order: 0,
    options: null,
    missionaryId: randomUUID(),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: null,
    updatedBy: null,
    version: 0,
    deletedAt: null,
    ...overrides,
  };
}
