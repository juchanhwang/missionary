import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type PaginatedParticipationsResponse,
  participationApi,
} from 'apis/participation';
import { queryKeys } from 'lib/queryKeys';
import { toast } from 'sonner';

export function useTogglePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPaid }: { id: string; isPaid: boolean }) =>
      participationApi.updateParticipation(id, { isPaid }),
    onMutate: async ({ id, isPaid }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.participations.all,
      });

      const previousQueries =
        queryClient.getQueriesData<PaginatedParticipationsResponse>({
          queryKey: queryKeys.participations.all,
        });

      // 낙관적 업데이트: 목록에서 해당 참가자의 isPaid를 즉시 반영
      queryClient.setQueriesData<PaginatedParticipationsResponse>(
        { queryKey: queryKeys.participations.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === id ? { ...item, isPaid } : item,
            ),
          };
        },
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      // 롤백
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error('납부 상태 변경에 실패했습니다.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.participations.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.enrollmentSummary.all,
      });
    },
  });
}
