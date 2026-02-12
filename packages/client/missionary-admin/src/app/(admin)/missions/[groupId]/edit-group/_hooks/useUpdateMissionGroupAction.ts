import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type UpdateMissionGroupPayload,
  missionGroupApi,
} from 'apis/missionGroup';
import { queryKeys } from 'lib/queryKeys';

export function useUpdateMissionGroupAction(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMissionGroupPayload) =>
      missionGroupApi.updateMissionGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missionGroups.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.missionGroups.detail(id),
      });
    },
  });
}
