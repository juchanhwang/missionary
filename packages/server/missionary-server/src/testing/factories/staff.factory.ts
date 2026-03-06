import { randomUUID } from 'crypto';

import type { MissionaryStaff } from '../../../prisma/generated/prisma';

export function makeMissionaryStaff(
  overrides: Partial<MissionaryStaff> = {},
): MissionaryStaff {
  return {
    id: randomUUID(),
    role: 'MEMBER',
    missionaryId: randomUUID(),
    userId: randomUUID(),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: null,
    updatedBy: null,
    version: 0,
    deletedAt: null,
    ...overrides,
  };
}
