import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type UpdateParticipationPayload,
  participationApi,
} from 'apis/participation';
import { queryKeys } from 'lib/queryKeys';
import { toast } from 'sonner';

export function useUpdateParticipation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateParticipationPayload;
    }) => participationApi.updateParticipation(id, data),
    onSuccess: (_data, variables) => {
      toast.success('등록자 정보가 수정되었습니다.');
      queryClient.invalidateQueries({
        queryKey: queryKeys.participations.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.participations.all,
      });
    },
    onError: () => {
      toast.error('수정에 실패했습니다. 다시 시도해주세요.');
    },
  });
}
