import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { userApi } from 'apis/user';
import { queryKeys } from 'lib/queryKeys';

import { UsersPageClient } from './_components/UsersPageClient';
import { buildUserQueryParams } from './_utils/parseUserFilterParams';

interface PageProps {
  searchParams: Promise<{
    searchType?: string;
    keyword?: string;
    role?: string;
    provider?: string;
    isBaptized?: string;
    page?: string;
    userId?: string;
  }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const queryClient = new QueryClient();
  const queryParams = buildUserQueryParams(rawParams);

  await queryClient.prefetchQuery({
    queryKey: queryKeys.users.list(queryParams),
    queryFn: () => userApi.getUsers(queryParams).then((r) => r.data),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersPageClient />
    </HydrationBoundary>
  );
}
