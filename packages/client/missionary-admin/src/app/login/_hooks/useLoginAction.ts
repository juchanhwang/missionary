import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from 'apis/auth';
import { queryKeys } from 'lib/queryKeys';

export function useLoginAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}
