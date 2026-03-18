import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type UpdateMissionaryRegionPayload,
  missionaryRegionApi,
} from 'apis/missionaryRegion';
import { queryKeys } from 'lib/queryKeys';

export function useUpdateMissionaryRegion(
  missionaryId: number,
  regionId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMissionaryRegionPayload) =>
      missionaryRegionApi.updateRegion(missionaryId, regionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.missionaryRegions.all,
      });
    },
  });
}
