import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'lib/queryKeys';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  useCreateFormField,
  useDeleteFormField,
  useReorderFormFields,
  useUpdateFormField,
} from './useFormFieldMutations';

import type { LocalFormFieldWithMeta } from './useLocalFields';
import type { FormFieldDefinition, FormFieldType } from 'apis/formField';

interface UseFormSaveParams {
  localFields: LocalFormFieldWithMeta[];
  serverFields: FormFieldDefinition[];
  missionaryId: string;
  onValidationError: (fieldId: string, message: string) => void;
  onSuccess: () => void;
  onError: () => void;
}

export function useFormSave({
  localFields,
  serverFields,
  missionaryId,
  onValidationError,
  onSuccess,
  onError,
}: UseFormSaveParams) {
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const createField = useCreateFormField(missionaryId);
  const updateField = useUpdateFormField(missionaryId);
  const deleteField = useDeleteFormField(missionaryId);
  const reorderFields = useReorderFormFields(missionaryId);

  const save = async () => {
    // 유효성 검증
    const invalidField = localFields.find((f) => !f.label.trim());
    if (invalidField) {
      onValidationError(invalidField.id, '라벨이 비어있는 필드가 있습니다.');
      return;
    }

    const selectWithoutOptions = localFields.find(
      (f) => f.fieldType === 'SELECT' && (!f.options || f.options.length === 0),
    );
    if (selectWithoutOptions) {
      onValidationError(
        selectWithoutOptions.id,
        '선택 타입 필드에는 최소 1개의 선택지가 필요합니다.',
      );
      return;
    }

    setIsSaving(true);

    try {
      const serverFieldIds = new Set(serverFields.map((f) => f.id));

      // 1. 삭제된 필드 처리
      const deletedIds = serverFields
        .filter((sf) => !localFields.some((lf) => lf.id === sf.id))
        .map((sf) => sf.id);

      for (const id of deletedIds) {
        await deleteField.mutateAsync(id);
      }

      // 2. 새 필드 생성 (임시 ID → 서버 ID 매핑)
      const idMap = new Map<string, string>();
      for (let i = 0; i < localFields.length; i++) {
        const field = localFields[i];
        if (!serverFieldIds.has(field.id)) {
          const response = await createField.mutateAsync({
            fieldType: field.fieldType as FormFieldType,
            label: field.label,
            placeholder: field.placeholder ?? undefined,
            isRequired: field.isRequired,
            order: i,
            options: field.options ?? undefined,
          });
          idMap.set(field.id, response.data.id);
        }
      }

      // 3. 기존 필드 업데이트
      for (const field of localFields) {
        if (!serverFieldIds.has(field.id)) continue;

        const serverField = serverFields.find((sf) => sf.id === field.id);
        if (!serverField) continue;

        const hasChanged =
          serverField.label !== field.label ||
          serverField.placeholder !== field.placeholder ||
          serverField.isRequired !== field.isRequired ||
          JSON.stringify(serverField.options) !== JSON.stringify(field.options);

        if (hasChanged) {
          await updateField.mutateAsync({
            fieldId: field.id,
            data: {
              label: field.label,
              placeholder: field.placeholder ?? undefined,
              isRequired: field.isRequired,
              options: field.options ?? undefined,
            },
          });
        }
      }

      // 4. 순서 변경
      const reorderItems = localFields.map((f, index) => ({
        id: idMap.get(f.id) ?? f.id,
        order: index,
      }));
      await reorderFields.mutateAsync(reorderItems);

      onSuccess();
    } catch {
      // 부분 성공 상태를 서버와 재동기화
      await queryClient.invalidateQueries({
        queryKey: queryKeys.formFields.list(missionaryId),
      });
      toast.error(
        '일부 필드 저장에 실패했습니다. 서버 상태를 다시 불러옵니다.',
      );
      onError();
    } finally {
      setIsSaving(false);
    }
  };

  return { save, isSaving };
}
