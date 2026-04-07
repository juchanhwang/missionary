import { cache } from 'react';

import { createServerApi } from './serverInstance';

import type { GetUsersParams, PaginatedUsersResponse, User } from './user';

export const getServerUsers = cache(async (params?: GetUsersParams) => {
  const serverApi = await createServerApi();
  const { data } = await serverApi.get<PaginatedUsersResponse>('/users', {
    params,
  });
  return data;
});

export const getServerUser = cache(async (id: string) => {
  const serverApi = await createServerApi();
  const { data } = await serverApi.get<User>(`/users/${id}`);
  return data;
});
