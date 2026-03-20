import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { missionaryRegionApi } from 'apis/missionaryRegion';
import { missionGroupApi } from 'apis/missionGroup';
import { stripEmpty } from 'apis/utils';
import { queryKeys } from 'lib/queryKeys';
import Script from 'next/script';

import { MissionaryRegionsPageClient } from './_components/MissionaryRegionsPageClient';

const ITEMS_PER_PAGE = 20;

interface PageProps {
  searchParams: Promise<{
    query?: string;
    missionGroupId?: string;
    missionaryId?: string;
    page?: string;
  }>;
}

export default async function RegionsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const page = Number(rawParams.page) || 1;
  const queryClient = new QueryClient();

  const apiParams = stripEmpty({
    missionGroupId: rawParams.missionGroupId,
    missionaryId: rawParams.missionaryId,
    query: rawParams.query,
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE,
  });

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.missionaryRegions.list(apiParams),
      queryFn: () =>
        missionaryRegionApi.getRegions(apiParams).then((r) => r.data),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.missionGroups.list(),
      queryFn: () => missionGroupApi.getMissionGroups().then((r) => r.data),
    }),
  ]);

  return (
    <>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MissionaryRegionsPageClient />
      </HydrationBoundary>
    </>
  );
}
