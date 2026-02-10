import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { type UseFormReturn } from 'react-hook-form';

import { type LoginFormData } from '../schemas/loginSchema';

const OAUTH_ERROR_MESSAGE = '소셜 로그인에 실패했습니다. 다시 시도해주세요.';

export function useOAuthError(form: UseFormReturn<LoginFormData>) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      form.setError('root.serverError', {
        message: OAUTH_ERROR_MESSAGE,
      });
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams, form]);
}
