import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from 'apis/user';
import { queryKeys } from 'lib/queryKeys';

export function useDeleteUserAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.all,
      });
    },
  });
}
