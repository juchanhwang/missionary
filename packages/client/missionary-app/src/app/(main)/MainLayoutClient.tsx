'use client';

import { type DehydratedState, HydrationBoundary } from '@tanstack/react-query';
import {
  AsyncBoundary,
  AuthErrorFallback,
  AuthLoadingFallback,
} from 'components/boundary';
import { AuthProvider } from 'lib/auth/AuthContext';

interface MainLayoutClientProps {
  children: React.ReactNode;
  dehydratedState: DehydratedState;
}

export function MainLayoutClient({
  children,
  dehydratedState,
}: MainLayoutClientProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <AsyncBoundary
        pendingFallback={<AuthLoadingFallback />}
        rejectedFallback={AuthErrorFallback}
      >
        <AuthProvider>
          <main className="min-h-screen">{children}</main>
        </AuthProvider>
      </AsyncBoundary>
    </HydrationBoundary>
  );
}
