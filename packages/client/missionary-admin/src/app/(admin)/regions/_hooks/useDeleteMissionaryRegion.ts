import { useMutation, useQueryClient } from '@tanstack/react-query';
import { missionaryRegionApi } from 'apis/missionaryRegion';
import { queryKeys } from 'lib/queryKeys';

interface DeleteRegionArgs {
  missionGroupId: string;
  regionId: string;
}

export function useDeleteMissionaryRegion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ missionGroupId, regionId }: DeleteRegionArgs) =>
      missionaryRegionApi.deleteRegion(missionGroupId, regionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.missionaryRegions.all,
      });
    },
  });
}
