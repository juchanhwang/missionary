import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateMissionGroupPayload, missionGroupApi } from 'apis/missionGroup';
import { queryKeys } from 'lib/queryKeys';

export function useCreateMissionGroupAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMissionGroupPayload) =>
      missionGroupApi.createMissionGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.missionGroups.all,
      });
    },
  });
}
