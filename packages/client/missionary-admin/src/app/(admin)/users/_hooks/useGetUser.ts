import { useQuery } from '@tanstack/react-query';
import { userApi } from 'apis/user';
import { queryKeys } from 'lib/queryKeys';

export function useGetUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const response = await userApi.getUser(id);
      return response.data;
    },
    enabled: id !== '',
  });
}
