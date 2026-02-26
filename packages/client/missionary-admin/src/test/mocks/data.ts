import { type AuthUser } from 'apis/auth';
import { type Missionary } from 'apis/missionary';
import { type MissionGroup, type MissionGroupDetail } from 'apis/missionGroup';

export function createMockAuthUser(
  overrides: Partial<AuthUser> = {},
): AuthUser {
  return {
    id: 1,
    email: 'admin@example.com',
    role: 'ADMIN',
    provider: 'LOCAL',
    ...overrides,
  };
}

export function createMockMissionGroup(
  overrides: Partial<MissionGroup> = {},
): MissionGroup {
  return {
    id: 'group-1',
    name: '필리핀 선교',
    category: 'ABROAD',
    createdAt: '2024-01-01T00:00:00.000Z',
    _count: { missionaries: 2 },
    ...overrides,
  };
}

export function createMockMissionGroupDetail(
  overrides: Partial<MissionGroupDetail> = {},
): MissionGroupDetail {
  return {
    id: 'group-1',
    name: '필리핀 선교',
    category: 'ABROAD',
    createdAt: '2024-01-01T00:00:00.000Z',
    missionaries: [],
    ...overrides,
  };
}

export function createMockMissionary(
  overrides: Partial<Missionary> = {},
): Missionary {
  return {
    id: 'missionary-1',
    name: '1차 선교',
    startDate: '2024-07-01',
    endDate: '2024-07-15',
    participationStartDate: '2024-05-01',
    participationEndDate: '2024-06-30',
    pastorName: '김목사',
    status: 'ENROLLMENT_OPENED',
    order: 1,
    missionGroupId: 'group-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}
