'use client';

import { type FallbackProps } from 'react-error-boundary';

import { ErrorFallback } from './ErrorFallback';

export function AuthErrorFallback(props: FallbackProps) {
  return <ErrorFallback {...props} title="인증 오류" fullscreen />;
}
