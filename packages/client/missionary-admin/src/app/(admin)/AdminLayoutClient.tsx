'use client';

import { OverlayProvider } from '@samilhero/design-system';
import { type DehydratedState, HydrationBoundary } from '@tanstack/react-query';
import {
  AsyncBoundary,
  AuthErrorFallback,
  AuthLoadingFallback,
} from 'components/boundary';
import { Header } from 'components/header';
import { Sidebar } from 'components/sidebar';
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
          <OverlayProvider>
            <SidebarProvider>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex flex-col flex-1 min-h-0 min-w-0 ml-0 lg:ml-[260px] bg-white transition-[margin-left] duration-300 ease-in-out">
                  <Header />
                  <main className="flex flex-col flex-1 min-h-0">
                    {children}
                  </main>
                </div>
              </div>
            </SidebarProvider>
          </OverlayProvider>
        </AuthProvider>
      </AsyncBoundary>
    </HydrationBoundary>
  );
}
