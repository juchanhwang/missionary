import { useQuery } from '@tanstack/react-query';
import {
  type GetUsersParams,
  type PaginatedUsersResponse,
  userApi,
} from 'apis/user';
import { queryKeys } from 'lib/queryKeys';

interface UseGetUsersOptions {
  params?: GetUsersParams;
  initialData?: PaginatedUsersResponse;
}

export function useGetUsers({ params, initialData }: UseGetUsersOptions = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: async () => {
      const response = await userApi.getUsers(params);
      return response.data;
    },
    initialData,
  });
}
