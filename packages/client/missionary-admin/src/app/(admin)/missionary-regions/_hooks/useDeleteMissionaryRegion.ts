import { useMutation, useQueryClient } from '@tanstack/react-query';
import { missionaryRegionApi } from 'apis/missionaryRegion';
import { queryKeys } from 'lib/queryKeys';

export function useDeleteMissionaryRegion(missionaryId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (regionId: number) =>
      missionaryRegionApi.deleteRegion(missionaryId, regionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.missionaryRegions.all,
      });
    },
  });
}
