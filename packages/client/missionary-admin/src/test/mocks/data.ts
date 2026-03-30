import { type AuthUser } from 'apis/auth';
import {
  type EnrollmentMissionSummary,
  type MissionEnrollmentSummary,
} from 'apis/enrollment';
import { type Missionary } from 'apis/missionary';
import {
  type DeletedRegionListItem,
  type RegionListItem,
} from 'apis/missionaryRegion';
import { type MissionGroup, type MissionGroupDetail } from 'apis/missionGroup';
import {
  type AttendanceOption,
  type FormFieldDefinition,
  type Participation,
} from 'apis/participation';
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
    currentParticipantCount: 0,
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
    note: null,
    missionGroupId: 'group-1',
    missionGroup: { id: 'group-1', name: '필리핀 선교' },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createMockRegionList(count: number): RegionListItem[] {
  return Array.from({ length: count }, (_, i) =>
    createMockRegion({
      id: `region-${i + 1}`,
      name: `교회${i + 1}`,
    }),
  );
}

export function createMockDeletedRegion(
  overrides: Partial<DeletedRegionListItem> = {},
): DeletedRegionListItem {
  return {
    ...createMockRegion(),
    deletedAt: '2026-03-15T00:00:00.000Z',
    ...overrides,
  };
}

export function createMockDeletedRegionList(
  count: number,
): DeletedRegionListItem[] {
  return Array.from({ length: count }, (_, i) =>
    createMockDeletedRegion({
      id: `deleted-region-${i + 1}`,
      name: `삭제교회${i + 1}`,
      deletedAt: new Date(2026, 2, 15 - i).toISOString(),
    }),
  );
}

// === Enrollment ===

export function createMockEnrollmentSummary(
  overrides: Partial<EnrollmentMissionSummary> = {},
): EnrollmentMissionSummary {
  return {
    id: 'missionary-1',
    name: '2026 여름 단기선교',
    order: 1,
    category: 'ABROAD',
    status: 'ENROLLMENT_OPENED',
    enrollmentDeadline: '2026-06-30T00:00:00.000Z',
    missionStartDate: '2026-07-01',
    missionEndDate: '2026-07-15',
    maximumParticipantCount: 50,
    currentParticipantCount: 30,
    paidCount: 20,
    managerName: '김목사',
    missionGroupName: '필리핀 선교',
    ...overrides,
  };
}

export function createMockMissionEnrollmentSummary(
  overrides: Partial<MissionEnrollmentSummary> = {},
): MissionEnrollmentSummary {
  return {
    totalParticipants: 30,
    maxParticipants: 50,
    paidCount: 20,
    unpaidCount: 10,
    fullAttendanceCount: 25,
    partialAttendanceCount: 5,
    ...overrides,
  };
}

export function createMockAttendanceOption(
  overrides: Partial<AttendanceOption> = {},
): AttendanceOption {
  return {
    id: 'att-opt-1',
    missionaryId: 'missionary-1',
    type: 'FULL',
    label: '전체 참석',
    order: 0,
    ...overrides,
  };
}

export function createMockFormFieldDefinition(
  overrides: Partial<FormFieldDefinition> = {},
): FormFieldDefinition {
  return {
    id: 'field-1',
    missionaryId: 'missionary-1',
    fieldType: 'TEXT',
    label: '교회명',
    placeholder: null,
    isRequired: false,
    order: 0,
    options: null,
    hasAnswers: false,
    ...overrides,
  };
}

export function createMockParticipation(
  overrides: Partial<Participation> = {},
): Participation {
  return {
    id: 'part-1',
    name: '홍길동',
    birthDate: '1999-01-01',
    applyFee: 500000,
    isPaid: false,
    identificationNumber: '990101-1234567',
    isOwnCar: false,
    missionaryId: 'missionary-1',
    userId: 'user-1',
    teamId: null,
    team: null,
    createdAt: '2026-03-01T00:00:00.000Z',
    affiliation: '서울교회',
    attendanceOptionId: 'att-opt-1',
    attendanceOption: createMockAttendanceOption(),
    cohort: 1,
    hasPastParticipation: false,
    isCollegeStudent: false,
    formAnswers: [],
    ...overrides,
  };
}

export function createMockParticipationList(count: number): Participation[] {
  return Array.from({ length: count }, (_, i) =>
    createMockParticipation({
      id: `part-${i + 1}`,
      name: `참가자${i + 1}`,
    }),
  );
}
