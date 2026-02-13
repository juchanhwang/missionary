'use client';

import { Button } from '@samilhero/design-system';
import { type FallbackProps } from 'react-error-boundary';

export function AuthErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const errorMessage =
    error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full bg-gray-10 gap-4">
      <h2 className="text-xl font-semibold text-gray-90 m-0">인증 오류</h2>
      <p className="text-sm text-gray-50 m-0">{errorMessage}</p>
      <Button
        type="button"
        size="md"
        color="neutral"
        onClick={resetErrorBoundary}
      >
        다시 시도
      </Button>
    </div>
  );
}
