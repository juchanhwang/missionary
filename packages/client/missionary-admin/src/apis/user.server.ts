import { cache } from 'react';
import 'server-only';

import { createServerApi } from './serverInstance';

import type { GetUsersParams, PaginatedUsersResponse, User } from './user';

// React.cache()는 인수를 참조 동등성으로 비교하므로 객체 파라미터 함수에서는
// dedupe가 동작하지 않는다. 잘못된 신호를 두지 않기 위해 cache()를 적용하지 않는다.
export async function getServerUsers(params?: GetUsersParams) {
  const serverApi = await createServerApi();
  const { data } = await serverApi.get<PaginatedUsersResponse>('/users', {
    params,
  });
  return data;
}

// id가 string이라 React.cache()의 참조 비교가 정상 동작한다.
export const getServerUser = cache(async (id: string) => {
  const serverApi = await createServerApi();
  const { data } = await serverApi.get<User>(`/users/${id}`);
  return data;
});
