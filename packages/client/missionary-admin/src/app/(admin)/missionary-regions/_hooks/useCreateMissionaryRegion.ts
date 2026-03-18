import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type CreateMissionaryRegionPayload,
  missionaryRegionApi,
} from 'apis/missionaryRegion';
import { queryKeys } from 'lib/queryKeys';

export function useCreateMissionaryRegion(missionaryId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMissionaryRegionPayload) =>
      missionaryRegionApi.createRegion(missionaryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.missionaryRegions.all,
      });
    },
  });
}
