import { randomUUID } from 'crypto';

import type { MissionaryAttendanceOption } from '../../../prisma/generated/prisma';

export function makeMissionaryAttendanceOption(
  overrides: Partial<MissionaryAttendanceOption> = {},
): MissionaryAttendanceOption {
  return {
    id: randomUUID(),
    type: 'FULL',
    label: '풀참석',
    order: 0,
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
