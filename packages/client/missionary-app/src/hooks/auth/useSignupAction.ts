import { useMutation } from '@tanstack/react-query';
import { userApi, type CreateUserDto } from 'apis/user';
import { useRouter } from 'next/navigation';

export function useSignupAction() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateUserDto) => userApi.create(data),
    onSuccess: () => {
      router.push('/login');
    },
  });
}
