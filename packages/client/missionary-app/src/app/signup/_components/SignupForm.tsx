'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, InputField } from '@samilhero/design-system';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { useSignupAction } from '../_hooks/useSignupAction';
import { signupSchema, type SignupFormData } from '../_schemas/signupSchema';

export function SignupForm() {
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      name: '',
    },
  });

  const signupMutation = useSignupAction();

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate(
      { email: data.email, password: data.password, name: data.name },
      {
        onError: (error: any) => {
          const message =
            error?.response?.data?.message || '회원가입에 실패했습니다.';
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
        <img
          src="/logo-horizontal.svg"
          alt="삼일교회 로고"
          className="w-[200px] h-auto mb-10"
        />
        <h1 className="mb-3 text-2xl font-bold leading-tight text-center text-gray-90">
          선교 시스템
          <br />
          회원가입
        </h1>
        <p className="mb-10 text-sm font-normal leading-relaxed text-center text-gray-50">
          새 계정을 만들어 주세요.
        </p>
        <div className="flex flex-col w-full gap-3">
          <InputField
            label="이름"
            hideLabel
            type="text"
            placeholder="이름 (선택)"
            {...form.register('name')}
            className="w-full"
          />
          <InputField
            label="이메일"
            hideLabel
            type="email"
            placeholder="이메일"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
            className="w-full"
          />
          <InputField
            label="비밀번호"
            hideLabel
            type="password"
            placeholder="비밀번호 (8자 이상)"
            {...form.register('password')}
            error={form.formState.errors.password?.message}
            className="w-full"
          />
          <InputField
            label="비밀번호 확인"
            hideLabel
            type="password"
            placeholder="비밀번호 확인"
            {...form.register('passwordConfirm')}
            error={
              form.formState.errors.passwordConfirm?.message ||
              form.formState.errors.root?.serverError?.message
            }
            className="w-full"
          />
        </div>
        <div className="w-full mt-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            color="neutral"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? '가입 중...' : '회원가입'}
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-50">
          이미 계정이 있으신가요?{' '}
          <Link
            href="/login"
            className="text-primary-50 font-medium hover:underline"
          >
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}
