'use client';

import { type DehydratedState, HydrationBoundary } from '@tanstack/react-query';
import {
  AsyncBoundary,
  AuthErrorFallback,
  AuthLoadingFallback,
} from 'components/boundary';
import { Header } from 'components/header/Header';
import { Sidebar } from 'components/sidebar/Sidebar';
import { AuthProvider } from 'lib/auth/AuthContext';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  dehydratedState: DehydratedState;
}

export function AdminLayoutClient({
  children,
  dehydratedState,
}: AdminLayoutClientProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <AsyncBoundary
        pendingFallback={<AuthLoadingFallback />}
        rejectedFallback={AuthErrorFallback}
      >
        <AuthProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1 ml-[260px] bg-gray-10">
              <Header />
              <main className="flex flex-col flex-1 min-h-0">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </AsyncBoundary>
    </HydrationBoundary>
  );
}
