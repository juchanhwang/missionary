import { randomUUID } from 'crypto';

import type {
  Missionary,
  MissionGroup,
  MissionaryRegion,
  MissionaryPoster,
} from '../../../prisma/generated/prisma';

export function makeMissionary(
  overrides: Partial<Missionary> = {},
): Missionary {
  return {
    id: randomUUID(),
    name: '테스트선교',
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-12-31T00:00:00Z'),
    pastorName: null,
    pastorPhone: null,
    participationStartDate: null,
    participationEndDate: null,
    price: null,
    description: null,
    maximumParticipantCount: null,
    currentParticipantCount: 0,
    bankName: null,
    bankAccountHolder: null,
    bankAccountNumber: null,
    status: 'ENROLLMENT_OPENED',
    missionGroupId: null,
    createdById: randomUUID(),
    order: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: null,
    updatedBy: null,
    version: 0,
    deletedAt: null,
    ...overrides,
  };
}

export function makeMissionGroup(
  overrides: Partial<MissionGroup> = {},
): MissionGroup {
  return {
    id: randomUUID(),
    name: '테스트선교그룹',
    description: null,
    category: 'DOMESTIC',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: null,
    updatedBy: null,
    version: 0,
    deletedAt: null,
    ...overrides,
  };
}

export function makeMissionaryRegion(
  overrides: Partial<MissionaryRegion> = {},
): MissionaryRegion {
  return {
    id: randomUUID(),
    name: '테스트지역',
    pastorName: null,
    pastorPhone: null,
    addressBasic: null,
    addressDetail: null,
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

export function makeMissionaryPoster(
  overrides: Partial<MissionaryPoster> = {},
): MissionaryPoster {
  return {
    id: randomUUID(),
    name: '테스트포스터',
    path: '/uploads/test-poster.jpg',
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
