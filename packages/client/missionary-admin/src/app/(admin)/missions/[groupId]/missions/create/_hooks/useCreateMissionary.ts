import { useMutation, useQueryClient } from '@tanstack/react-query';
import { missionaryApi, type CreateMissionaryPayload } from 'apis/missionary';
import { queryKeys } from 'lib/queryKeys';

export function useCreateMissionary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMissionaryPayload) =>
      missionaryApi.createMissionary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missionaries.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.missionGroups.all });
    },
  });
}
