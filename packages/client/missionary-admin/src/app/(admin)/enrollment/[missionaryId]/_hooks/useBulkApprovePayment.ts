import { useMutation, useQueryClient } from '@tanstack/react-query';
import { participationApi } from 'apis/participation';
import { queryKeys } from 'lib/queryKeys';
import { toast } from 'sonner';

export function useBulkApprovePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => participationApi.bulkApprovePayment(ids),
    onSuccess: (_data, variables) => {
      toast.success(`${variables.length}명의 납부가 승인되었습니다.`);
      queryClient.invalidateQueries({
        queryKey: queryKeys.participations.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.enrollmentSummary.all,
      });
    },
    onError: () => {
      toast.error('납부 승인에 실패했습니다. 다시 시도해주세요.');
    },
  });
}
