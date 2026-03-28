export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
  missionaries: {
    all: ['missionaries'] as const,
    list: () => [...queryKeys.missionaries.all, 'list'] as const,
    detail: (id: string) =>
      [...queryKeys.missionaries.all, 'detail', id] as const,
  },
  missionGroups: {
    all: ['missionGroups'] as const,
    list: () => [...queryKeys.missionGroups.all, 'list'] as const,
    detail: (id: string) =>
      [...queryKeys.missionGroups.all, 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    list: (params?: object) =>
      [...queryKeys.users.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },
  missionaryRegions: {
    all: ['missionaryRegions'] as const,
    list: (params?: object) =>
      [...queryKeys.missionaryRegions.all, 'list', params] as const,
  },
  enrollmentSummary: {
    all: ['enrollmentSummary'] as const,
    list: () => [...queryKeys.enrollmentSummary.all, 'list'] as const,
    detail: (missionaryId: string) =>
      [...queryKeys.enrollmentSummary.all, 'detail', missionaryId] as const,
  },
  participations: {
    all: ['participations'] as const,
    list: (params?: object) =>
      [...queryKeys.participations.all, 'list', params] as const,
    detail: (id: string) =>
      [...queryKeys.participations.all, 'detail', id] as const,
  },
  formFields: {
    all: ['formFields'] as const,
    list: (missionaryId: string) =>
      [...queryKeys.formFields.all, 'list', missionaryId] as const,
  },
  attendanceOptions: {
    all: ['attendanceOptions'] as const,
    list: (missionaryId: string) =>
      [...queryKeys.attendanceOptions.all, 'list', missionaryId] as const,
  },
} as const;
