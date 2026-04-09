import { useMutation, useQueryClient } from '@tanstack/react-query';
import { participationApi } from 'apis/participation';
import { type UpdateTeamPayload, teamApi } from 'apis/team';
import { queryKeys } from 'lib/queryKeys';
import { toast } from 'sonner';

interface UpdateTeamArgs {
  id: string;
  leaderParticipationId: string;
  data: UpdateTeamPayload;
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateTeamArgs) => teamApi.updateTeam(id, data),
    onSuccess: async (response, variables) => {
      try {
        await participationApi.updateParticipation(
          variables.leaderParticipationId,
          {
            teamId: variables.id,
          },
        );
      } catch {
        toast.error(
          '팀 정보는 수정되었지만 팀장 배치에 실패했습니다. 다시 시도해주세요.',
        );
      }

      toast.success('팀 정보가 수정되었습니다.');
      // 팀 메타 갱신 + 참가자 테이블의 "팀명" 컬럼 동기화 (R-2 v1.2)
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.list(response.data.missionaryId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.participations.all,
      });
    },
    onError: () => {
      toast.error('팀 수정에 실패했습니다. 다시 시도해주세요.');
    },
  });
}
