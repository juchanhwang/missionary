import { useMutation, useQueryClient } from '@tanstack/react-query';
import { missionaryRegionApi } from 'apis/missionaryRegion';
import { queryKeys } from 'lib/queryKeys';

import type { UpdateRegionPayload } from 'apis/missionaryRegion';

interface UpdateRegionArgs {
  missionaryId: string;
  regionId: string;
  data: UpdateRegionPayload;
}

export function useUpdateMissionaryRegion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ missionaryId, regionId, data }: UpdateRegionArgs) =>
      missionaryRegionApi.updateRegion(missionaryId, regionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.missionaryRegions.all,
      });
    },
  });
}
