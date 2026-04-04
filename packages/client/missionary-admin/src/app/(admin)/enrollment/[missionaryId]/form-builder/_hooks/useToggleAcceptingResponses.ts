import { useMutation, useQueryClient } from '@tanstack/react-query';
import { missionaryApi } from 'apis/missionary';
import { queryKeys } from 'lib/queryKeys';
import { toast } from 'sonner';

interface ToggleAcceptingResponsesPayload {
  isAcceptingResponses: boolean;
  closedMessage?: string | null;
}

export function useToggleAcceptingResponses(missionaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ToggleAcceptingResponsesPayload) =>
      missionaryApi.toggleAcceptingResponses(missionaryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.missionaries.detail(missionaryId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.enrollmentSummary.all,
      });
    },
    onError: () => {
      toast.error('등록 수신 상태 변경에 실패했습니다.');
    },
  });
}
