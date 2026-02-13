import { dehydrate, QueryClient } from '@tanstack/react-query';
import { type AuthUser } from 'apis/auth';
import { createServerApi } from 'apis/serverInstance';
import { queryKeys } from 'lib/queryKeys';

import { MainLayoutClient } from './MainLayoutClient';

export const dynamic = 'force-dynamic';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  try {
    const serverApi = await createServerApi();

    await queryClient.prefetchQuery({
      queryKey: queryKeys.auth.me(),
      queryFn: async () => {
        const res = await serverApi.get<AuthUser>('/auth/me');
        return res.data;
      },
    });
  } catch {
    // prefetch 실패 시 클라이언트에서 재시도
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <MainLayoutClient dehydratedState={dehydratedState}>
      {children}
    </MainLayoutClient>
  );
}
