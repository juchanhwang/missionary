import { type AuthUser } from 'apis/auth';
import { type Missionary } from 'apis/missionary';
import { type RegionListItem } from 'apis/missionaryRegion';
import { type MissionGroup, type MissionGroupDetail } from 'apis/missionGroup';
import { type User } from 'apis/user';

export function createMockAuthUser(
  overrides: Partial<AuthUser> = {},
): AuthUser {
  return {
    id: 'user-1',
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

export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'user@example.com',
    name: '홍길동',
    phoneNumber: '010-1234-5678',
    identityNumber: '990101-1******',
    loginId: 'hong123',
    provider: 'LOCAL',
    role: 'USER',
    gender: 'MALE',
    birthDate: '1999-01-01T00:00:00.000Z',
    isBaptized: true,
    baptizedAt: '2020-06-15T00:00:00.000Z',
    deletedAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createMockUserList(count: number): User[] {
  return Array.from({ length: count }, (_, i) =>
    createMockUser({
      id: `550e8400-e29b-41d4-a716-44665544000${i}`,
      email: `user${i + 1}@example.com`,
      name: `사용자${i + 1}`,
      loginId: `user${i + 1}`,
    }),
  );
}

export function createMockRegion(
  overrides: Partial<RegionListItem> = {},
): RegionListItem {
  return {
    id: 'region-1',
    name: '서울교회',
    pastorName: '김목사',
    pastorPhone: '010-1234-5678',
    addressBasic: '서울 강남구 테헤란로 123',
    addressDetail: '4층',
    missionaryId: 'missionary-1',
    missionary: {
      id: 'missionary-1',
      name: '1차 선교',
      order: 1,
      missionGroup: { id: 'group-1', name: '필리핀 선교' },
    },
    ...overrides,
  };
}

export function createMockRegionList(count: number): RegionListItem[] {
  return Array.from({ length: count }, (_, i) =>
    createMockRegion({
      id: `region-${i + 1}`,
      name: `교회${i + 1}`,
      missionaryId: `missionary-${i + 1}`,
    }),
  );
}
