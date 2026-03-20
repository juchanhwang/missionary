import { useMutation, useQueryClient } from '@tanstack/react-query';
import { missionaryRegionApi } from 'apis/missionaryRegion';
import { queryKeys } from 'lib/queryKeys';

import type { CreateRegionPayload } from 'apis/missionaryRegion';

interface CreateRegionArgs {
  missionGroupId: string;
  data: CreateRegionPayload;
}

export function useCreateMissionaryRegion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ missionGroupId, data }: CreateRegionArgs) =>
      missionaryRegionApi.createRegion(missionGroupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.missionaryRegions.all,
      });
    },
  });
}
