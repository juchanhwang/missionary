import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { missionaryRegionApi } from 'apis/missionaryRegion';
import { stripEmpty } from 'apis/utils';
import { queryKeys } from 'lib/queryKeys';

import { ITEMS_PER_PAGE } from './useRegionFilterParams';

interface UseGetDeletedRegionsParams {
  missionGroupId?: string;
  query?: string;
  page?: number;
}

export function useGetDeletedRegions(params: UseGetDeletedRegionsParams = {}) {
  const { page = 1, ...filterParams } = params;
  const apiParams = stripEmpty({
    ...filterParams,
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE,
  });

  return useQuery({
    queryKey: [...queryKeys.missionaryRegions.all, 'deleted', apiParams],
    queryFn: async () => {
      const response = await missionaryRegionApi.getDeletedRegions(apiParams);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
