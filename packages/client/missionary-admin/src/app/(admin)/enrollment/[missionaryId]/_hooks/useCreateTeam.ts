import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type CreateTeamPayload, teamApi } from 'apis/team';
import { queryKeys } from 'lib/queryKeys';
import { toast } from 'sonner';

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeamPayload) => teamApi.createTeam(data),
    onSuccess: (_response, variables) => {
      toast.success('팀이 생성되었습니다.');
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.list(variables.missionaryId),
      });
    },
    onError: () => {
      toast.error('팀 생성에 실패했습니다. 다시 시도해주세요.');
    },
  });
}
