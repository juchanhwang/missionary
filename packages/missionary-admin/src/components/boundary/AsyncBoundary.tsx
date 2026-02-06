'use client';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { type ComponentType, type ReactNode, Suspense } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

interface AsyncBoundaryProps {
  children: ReactNode;
  pendingFallback: ReactNode;
  rejectedFallback?: ComponentType<FallbackProps>;
}

function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage =
    error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';

  return (
    <div role="alert">
      <h2>오류가 발생했습니다</h2>
      <pre style={{ color: 'red' }}>{errorMessage}</pre>
      <button type="button" onClick={resetErrorBoundary}>
        다시 시도
      </button>
    </div>
  );
}

export function AsyncBoundary({
  children,
  pendingFallback,
  rejectedFallback: RejectedFallback = DefaultErrorFallback,
}: AsyncBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={RejectedFallback}>
          <Suspense fallback={pendingFallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
