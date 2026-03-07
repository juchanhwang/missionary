import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type UpdateUserPayload, userApi } from 'apis/user';
import { queryKeys } from 'lib/queryKeys';

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserPayload) => userApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.all,
      });
    },
  });
}
