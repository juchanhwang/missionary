import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { userApi } from 'apis/user';
import { queryKeys } from 'lib/queryKeys';

import type { GetUsersParams } from 'apis/user';

interface UseGetUsersOptions {
  params?: GetUsersParams;
}

export function useGetUsers({ params }: UseGetUsersOptions = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: async () => {
      const response = await userApi.getUsers(params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
