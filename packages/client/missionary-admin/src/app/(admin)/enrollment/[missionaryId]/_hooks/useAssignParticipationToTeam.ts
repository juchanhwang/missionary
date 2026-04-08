import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type PaginatedParticipationsResponse,
  participationApi,
} from 'apis/participation';
import { queryKeys } from 'lib/queryKeys';
import { toast } from 'sonner';

interface AssignArgs {
  participationId: string;
  teamId: string | null;
}

/**
 * 드래그 앤 드롭으로 참가자를 팀에 배치/해제하는 mutation. fe-plan v1.2 §3-3.
 *
 * Optimistic update 전략:
 * - `onMutate`에서 `participations` 캐시의 해당 participation을 즉시 업데이트 (teamId 덮어쓰기)
 * - `onError`에서 snapshot을 복원하고 에러 토스트
 * - `onSettled`에서 `participations` invalidate하여 BE 정합성 보장
 *
 * 직렬화:
 * - `scope.id`를 지정하여 같은 scope의 mutation이 병렬 실행되지 않도록 한다.
 *   연속 드래그 시 A 실패 + B 성공이 뒤섞여 B의 optimistic update가 A의 rollback
 *   snapshot으로 덮여 UI가 플리커하는 race condition을 방지한다.
 *   참고: https://tanstack.com/query/latest/docs/reference/useMutation
 *
 * toast 전략:
 * - 성공 시 토스트 생략 (드래그는 빈번한 액션, 노이즈 방지)
 * - 실패 시에만 토스트 + optimistic rollback
 */
export function useAssignParticipationToTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    scope: { id: 'assign-participation-team' },
    mutationFn: ({ participationId, teamId }: AssignArgs) =>
      participationApi.updateParticipation(participationId, { teamId }),

    onMutate: async ({ participationId, teamId }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.participations.all,
      });

      // 영향을 받는 모든 `participations list` 쿼리의 스냅샷을 저장한다.
      const snapshots =
        queryClient.getQueriesData<PaginatedParticipationsResponse>({
          queryKey: queryKeys.participations.all,
        });

      snapshots.forEach(([queryKey, snapshot]) => {
        if (!snapshot) return;
        queryClient.setQueryData<PaginatedParticipationsResponse>(queryKey, {
          ...snapshot,
          data: snapshot.data.map((p) =>
            p.id === participationId ? { ...p, teamId } : p,
          ),
        });
      });

      return { snapshots };
    },

    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([queryKey, snapshot]) => {
        queryClient.setQueryData(queryKey, snapshot);
      });
      toast.error('팀 배치에 실패했습니다. 다시 시도해주세요.');
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.participations.all,
      });
    },
  });
}
