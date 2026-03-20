import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { missionaryRegionApi } from 'apis/missionaryRegion';
import { stripEmpty } from 'apis/utils';
import { queryKeys } from 'lib/queryKeys';

import { ITEMS_PER_PAGE } from './useRegionFilterParams';

interface UseGetMissionaryRegionsParams {
  missionGroupId?: string;
  query?: string;
  page?: number;
}

export function useGetMissionaryRegions(
  params: UseGetMissionaryRegionsParams = {},
) {
  const { page = 1, ...filterParams } = params;
  const apiParams = stripEmpty({
    ...filterParams,
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE,
  });

  return useQuery({
    queryKey: queryKeys.missionaryRegions.list(apiParams),
    queryFn: async () => {
      const response = await missionaryRegionApi.getRegions(apiParams);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
