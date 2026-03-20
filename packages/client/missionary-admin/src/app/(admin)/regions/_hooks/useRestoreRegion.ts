import { useMutation, useQueryClient } from '@tanstack/react-query';
import { missionaryRegionApi } from 'apis/missionaryRegion';
import { queryKeys } from 'lib/queryKeys';

interface RestoreRegionArgs {
  missionGroupId: string;
  regionId: string;
}

export function useRestoreRegion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ missionGroupId, regionId }: RestoreRegionArgs) =>
      missionaryRegionApi.restoreRegion(missionGroupId, regionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.missionaryRegions.all,
      });
    },
  });
}
