import { useMutation, useQueryClient } from '@tanstack/react-query';
import { missionaryApi } from 'apis/missionary';
import { queryKeys } from 'lib/queryKeys';

export function useDeleteMissionary(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => missionaryApi.deleteMissionary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missionaries.all });
    },
  });
}
