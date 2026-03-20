import { useMutation, useQueryClient } from '@tanstack/react-query';
import { missionaryRegionApi } from 'apis/missionaryRegion';
import { queryKeys } from 'lib/queryKeys';

interface DeleteRegionArgs {
  missionaryId: string;
  regionId: string;
}

export function useDeleteMissionaryRegion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ missionaryId, regionId }: DeleteRegionArgs) =>
      missionaryRegionApi.deleteRegion(missionaryId, regionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.missionaryRegions.all,
      });
    },
  });
}
