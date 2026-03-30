import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  attendanceOptionApi,
  type CreateAttendanceOptionPayload,
  type UpdateAttendanceOptionPayload,
} from 'apis/attendanceOption';
import { queryKeys } from 'lib/queryKeys';
import { toast } from 'sonner';

export function useCreateAttendanceOption(missionaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttendanceOptionPayload) =>
      attendanceOptionApi.createAttendanceOption(missionaryId, data),
    onSuccess: () => {
      toast.success('참석 옵션이 추가되었습니다.');
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendanceOptions.list(missionaryId),
      });
    },
    onError: () => {
      toast.error('참석 옵션 추가에 실패했습니다.');
    },
  });
}

export function useUpdateAttendanceOption(missionaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      optionId,
      data,
    }: {
      optionId: string;
      data: UpdateAttendanceOptionPayload;
    }) =>
      attendanceOptionApi.updateAttendanceOption(missionaryId, optionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendanceOptions.list(missionaryId),
      });
    },
    onError: () => {
      toast.error('참석 옵션 수정에 실패했습니다.');
    },
  });
}

export function useDeleteAttendanceOption(missionaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (optionId: string) =>
      attendanceOptionApi.deleteAttendanceOption(missionaryId, optionId),
    onSuccess: () => {
      toast.success('참석 옵션이 삭제되었습니다.');
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendanceOptions.list(missionaryId),
      });
    },
    onError: () => {
      toast.error('참석 옵션을 삭제할 수 없습니다.');
    },
  });
}
