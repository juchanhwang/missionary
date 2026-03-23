'use client';

import { Button } from '@samilhero/design-system';
import { type FallbackProps } from 'react-error-boundary';

interface ErrorFallbackProps extends FallbackProps {
  title?: string;
  fullscreen?: boolean;
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  title = '오류가 발생했습니다',
  fullscreen = false,
}: ErrorFallbackProps) {
  const errorMessage =
    error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';

  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-3 p-6${fullscreen ? ' justify-center h-screen w-full bg-gray-50' : ''}`}
    >
      <h2 className="text-lg font-semibold text-gray-900 m-0">{title}</h2>
      <p className="text-sm text-gray-500 m-0">{errorMessage}</p>
      <Button
        type="button"
        size="md"
        color="primary"
        onClick={resetErrorBoundary}
      >
        다시 시도
      </Button>
    </div>
  );
}
