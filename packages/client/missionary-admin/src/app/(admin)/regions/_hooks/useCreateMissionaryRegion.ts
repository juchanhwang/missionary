import { useMutation, useQueryClient } from '@tanstack/react-query';
import { missionaryRegionApi } from 'apis/missionaryRegion';
import { queryKeys } from 'lib/queryKeys';

import type { CreateRegionPayload } from 'apis/missionaryRegion';

interface CreateRegionArgs {
  missionaryId: string;
  data: CreateRegionPayload;
}

export function useCreateMissionaryRegion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ missionaryId, data }: CreateRegionArgs) =>
      missionaryRegionApi.createRegion(missionaryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.missionaryRegions.all,
      });
    },
  });
}
