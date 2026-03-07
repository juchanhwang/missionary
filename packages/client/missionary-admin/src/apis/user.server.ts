import { createServerApi } from './serverInstance';

import type { GetUsersParams, PaginatedUsersResponse, User } from './user';

export async function getServerUsers(params?: GetUsersParams) {
  const serverApi = await createServerApi();
  const { data } = await serverApi.get<PaginatedUsersResponse>('/users', {
    params,
  });
  return data;
}

export async function getServerUser(id: string) {
  const serverApi = await createServerApi();
  const { data } = await serverApi.get<User>(`/users/${id}`);
  return data;
}
