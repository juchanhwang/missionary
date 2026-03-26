import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  formFieldApi,
  type CreateFormFieldPayload,
  type UpdateFormFieldPayload,
} from 'apis/formField';
import { queryKeys } from 'lib/queryKeys';
import { toast } from 'sonner';

export function useCreateFormField(missionaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFormFieldPayload) =>
      formFieldApi.createFormField(missionaryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.formFields.list(missionaryId),
      });
    },
  });
}

export function useUpdateFormField(missionaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fieldId,
      data,
    }: {
      fieldId: string;
      data: UpdateFormFieldPayload;
    }) => formFieldApi.updateFormField(missionaryId, fieldId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.formFields.list(missionaryId),
      });
    },
  });
}

export function useDeleteFormField(missionaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fieldId: string) =>
      formFieldApi.deleteFormField(missionaryId, fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.formFields.list(missionaryId),
      });
    },
  });
}

export function useReorderFormFields(missionaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: { id: string; order: number }[]) =>
      formFieldApi.reorderFormFields(missionaryId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.formFields.list(missionaryId),
      });
      toast.success('저장되었습니다.');
    },
  });
}
