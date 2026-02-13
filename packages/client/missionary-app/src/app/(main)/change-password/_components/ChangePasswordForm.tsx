'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, InputField } from '@samilhero/design-system';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { useChangePasswordAction } from '../_hooks/useChangePasswordAction';
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '../_schemas/changePasswordSchema';

export function ChangePasswordForm() {
  const router = useRouter();
  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onSubmit',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
    },
  });

  const changePasswordMutation = useChangePasswordAction();

  const onSubmit = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          router.push('/');
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message || '비밀번호 변경에 실패했습니다.';
          form.setError('root.serverError', { message });
        },
      },
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gray-10">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-center w-[400px] rounded-2xl bg-white border border-gray-40 p-10"
      >
        <h1 className="mb-3 text-2xl font-bold leading-tight text-center text-gray-90">
          비밀번호 변경
        </h1>
        <p className="mb-10 text-sm font-normal leading-relaxed text-center text-gray-50">
          현재 비밀번호를 확인한 후
          <br />새 비밀번호를 설정하세요.
        </p>
        <div className="flex flex-col w-full gap-3">
          <InputField
            label="현재 비밀번호"
            hideLabel
            type="password"
            placeholder="현재 비밀번호"
            {...form.register('currentPassword')}
            error={form.formState.errors.currentPassword?.message}
            className="w-full"
          />
          <InputField
            label="새 비밀번호"
            hideLabel
            type="password"
            placeholder="새 비밀번호 (8자 이상)"
            {...form.register('newPassword')}
            error={form.formState.errors.newPassword?.message}
            className="w-full"
          />
          <InputField
            label="새 비밀번호 확인"
            hideLabel
            type="password"
            placeholder="새 비밀번호 확인"
            {...form.register('newPasswordConfirm')}
            error={
              form.formState.errors.newPasswordConfirm?.message ||
              form.formState.errors.root?.serverError?.message
            }
            className="w-full"
          />
        </div>
        <div className="w-full mt-4 flex flex-col gap-3">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            color="neutral"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? '변경 중...' : '비밀번호 변경'}
          </Button>
          <Button
            type="button"
            size="lg"
            className="w-full"
            color="neutral"
            variant="outline"
            onClick={() => router.back()}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}
