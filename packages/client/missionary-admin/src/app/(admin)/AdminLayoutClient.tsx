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
import { SidebarProvider } from 'lib/sidebar/SidebarContext';

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
          <SidebarProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex flex-col flex-1 ml-0 lg:ml-[260px] bg-gray-10 transition-[margin-left] duration-300 ease-in-out">
                <Header />
                <main className="flex flex-col flex-1 min-h-0">{children}</main>
              </div>
            </div>
          </SidebarProvider>
        </AuthProvider>
      </AsyncBoundary>
    </HydrationBoundary>
  );
}
