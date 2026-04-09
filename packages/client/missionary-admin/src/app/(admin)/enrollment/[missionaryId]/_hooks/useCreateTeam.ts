import { useMutation, useQueryClient } from '@tanstack/react-query';
import { participationApi } from 'apis/participation';
import { type CreateTeamPayload, teamApi } from 'apis/team';
import { queryKeys } from 'lib/queryKeys';
import { toast } from 'sonner';

interface CreateTeamArgs extends CreateTeamPayload {
  leaderParticipationId: string;
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leaderParticipationId: _leaderParticipationId,
      ...data
    }: CreateTeamArgs) => teamApi.createTeam(data),
    onSuccess: async (response, variables) => {
      try {
        await participationApi.updateParticipation(
          variables.leaderParticipationId,
          {
            teamId: response.data.id,
          },
        );
      } catch {
        toast.error(
          '팀은 생성되었지만 팀장 배치에 실패했습니다. 다시 시도해주세요.',
        );
      }

      toast.success('팀이 생성되었습니다.');
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.list(variables.missionaryId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.participations.all,
      });
    },
    onError: () => {
      toast.error('팀 생성에 실패했습니다. 다시 시도해주세요.');
    },
  });
}
