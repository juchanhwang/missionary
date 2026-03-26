import { randomUUID } from 'crypto';

import type { Participation } from '../../../prisma/generated/prisma';

export function makeParticipation(
  overrides: Partial<Participation> = {},
): Participation {
  return {
    id: randomUUID(),
    name: '테스트참가자',
    birthDate: '2000-01-01',
    applyFee: null,
    isPaid: false,
    identificationNumber: null,
    isOwnCar: false,
    missionaryId: randomUUID(),
    userId: randomUUID(),
    memberId: null,
    teamId: null,
    affiliation: null,
    attendanceOptionId: null,
    cohort: null,
    hasPastParticipation: null,
    isCollegeStudent: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: null,
    updatedBy: null,
    version: 0,
    deletedAt: null,
    ...overrides,
  };
}
