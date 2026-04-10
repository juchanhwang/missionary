import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from 'apis/team';
import { queryKeys } from 'lib/queryKeys';
import { toast } from 'sonner';

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamApi.deleteTeam(id),
    onSuccess: () => {
      toast.success('팀이 삭제되었습니다.');
      // 배치된 멤버는 BE가 teamId NULL로 풀어주므로 두 키 모두 invalidate (R-2 v1.2)
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.participations.all,
      });
    },
    onError: () => {
      toast.error('팀 삭제에 실패했습니다. 다시 시도해주세요.');
    },
  });
}
