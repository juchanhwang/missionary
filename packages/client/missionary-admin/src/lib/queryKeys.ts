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
} as const;
