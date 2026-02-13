import { useMutation } from '@tanstack/react-query';
import { authApi } from 'apis/auth';

export function useChangePasswordAction() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => authApi.changePassword(currentPassword, newPassword),
  });
}
