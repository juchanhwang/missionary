'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, InputField } from '@samilhero/design-system';
import { useForm } from 'react-hook-form';

import { useLogin } from './hooks/useLogin';
import { useOAuthError } from './hooks/useOAuthError';
import { useSocialLogin } from './hooks/useSocialLogin';
import { loginSchema, type LoginFormData } from './schemas/loginSchema';

export default function LoginPage() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useLogin();
  const { loginGoogle, loginKakao } = useSocialLogin();
  useOAuthError(form);

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onError: () => {
        form.setError('root.serverError', {
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        });
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-white">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-center w-[400px]"
      >
        <img
          src="/logo-horizontal.svg"
          alt="삼일교회 로고"
          className="w-[228px] h-[60px] mb-[50px]"
        />
        <h1 className="m-[0_0_12px] text-[34px] font-bold leading-[1.18] text-center text-black">
          삼일교회 선교 담당
          <br />
          교역자 로그인
        </h1>
        <p className="m-[0_0_60px] text-[16px] font-normal leading-[1.375] text-center text-black">
          전달받은 선교 담당 계정으로
          <br />
          로그인 하세요.
        </p>
        <div className="flex flex-col w-full gap-3">
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
            placeholder="비밀번호"
            {...form.register('password')}
            error={
              form.formState.errors.password?.message ||
              form.formState.errors.root?.serverError?.message
            }
            className="w-full"
          />
        </div>
        <div className="w-full mt-3">
          <Button
            type="submit"
            size="lg"
            width={400}
            color="primary"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? '로그인 중...' : '로그인'}
          </Button>
        </div>

        <div className="relative flex items-center justify-center w-full my-6 before:content-[''] before:flex-1 before:h-px before:bg-gray-10 after:content-[''] after:flex-1 after:h-px after:bg-gray-10">
          <span className="px-3 text-[13px] text-gray-30">또는</span>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            type="button"
            onClick={loginGoogle}
            className="flex items-center justify-center h-12 w-full rounded-lg bg-[#F2F2F2] border border-[#747775] text-sm font-medium text-[#1F1F1F] hover:bg-[#E8E8E8] transition-colors"
          >
            Google로 로그인
          </button>
          <button
            type="button"
            onClick={loginKakao}
            className="flex items-center justify-center h-12 w-full rounded-lg bg-[#FEE500] text-sm font-medium text-[#191919] hover:bg-[#E6CF00] transition-colors"
          >
            Kakao로 로그인
          </button>
        </div>
      </form>
    </div>
  );
}
