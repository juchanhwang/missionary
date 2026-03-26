'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AddFieldButton } from './AddFieldButton';
import { FormBuilderToolbar } from './FormBuilderToolbar';
import { FormFieldCard } from './FormFieldCard';
import {
  useCreateFormField,
  useDeleteFormField,
  useReorderFormFields,
  useUpdateFormField,
} from '../../_hooks/useFormFieldMutations';
import { useGetFormFields } from '../../_hooks/useGetFormFields';

import type { LocalFormField } from './FormFieldSettings';
import type { FormFieldType } from 'apis/formField';

interface LocalFormFieldWithMeta extends LocalFormField {
  hasAnswers: boolean;
  isNew?: boolean;
}

interface FormBuilderSectionProps {
  missionaryId: string;
}

let tempIdCounter = 0;
function createTempId() {
  return `temp-${Date.now()}-${++tempIdCounter}`;
}

function createEmptyField(): LocalFormFieldWithMeta {
  return {
    id: createTempId(),
    fieldType: 'TEXT',
    label: '',
    placeholder: null,
    isRequired: false,
    options: null,
    hasAnswers: false,
    isNew: true,
  };
}

export function FormBuilderSection({ missionaryId }: FormBuilderSectionProps) {
  const { data: serverFields = [] } = useGetFormFields({ missionaryId });

  const [localFields, setLocalFields] = useState<LocalFormFieldWithMeta[]>([]);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const createField = useCreateFormField(missionaryId);
  const updateField = useUpdateFormField(missionaryId);
  const deleteField = useDeleteFormField(missionaryId);
  const reorderFields = useReorderFormFields(missionaryId);

  // 서버 데이터 → 로컬 상태 동기화 (dirty 아닐 때만)
  useEffect(() => {
    if (!isDirty) {
      setLocalFields(
        serverFields.map((f) => ({
          id: f.id,
          fieldType: f.fieldType,
          label: f.label,
          placeholder: f.placeholder,
          isRequired: f.isRequired,
          options: f.options,
          hasAnswers: f.hasAnswers,
        })),
      );
    }
  }, [serverFields, isDirty]);

  // beforeunload 가드
  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // DnD 센서
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalFields((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id);
      const newIndex = prev.findIndex((f) => f.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setIsDirty(true);
  };

  const handleFieldChange = (id: string, updates: Partial<LocalFormField>) => {
    setLocalFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    );
    setIsDirty(true);
  };

  const handleAddField = () => {
    const newField = createEmptyField();
    setLocalFields((prev) => [...prev, newField]);
    setActiveFieldId(newField.id);
    setIsDirty(true);
  };

  const handleDeleteField = (id: string) => {
    setLocalFields((prev) => prev.filter((f) => f.id !== id));
    if (activeFieldId === id) {
      setActiveFieldId(null);
    }
    setIsDirty(true);
  };

  const handleToggleActive = (id: string) => {
    setActiveFieldId((prev) => (prev === id ? null : id));
  };

  // 저장: diff 계산 → 순차 API 호출
  const handleSave = async () => {
    // 유효성 검증
    const invalidField = localFields.find((f) => !f.label.trim());
    if (invalidField) {
      setActiveFieldId(invalidField.id);
      toast.error('라벨이 비어있는 필드가 있습니다.');
      return;
    }

    const selectWithoutOptions = localFields.find(
      (f) => f.fieldType === 'SELECT' && (!f.options || f.options.length === 0),
    );
    if (selectWithoutOptions) {
      setActiveFieldId(selectWithoutOptions.id);
      toast.error('선택 타입 필드에는 최소 1개의 선택지가 필요합니다.');
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
      for (const field of localFields) {
        if (!serverFieldIds.has(field.id)) {
          const response = await createField.mutateAsync({
            fieldType: field.fieldType as FormFieldType,
            label: field.label,
            placeholder: field.placeholder ?? undefined,
            isRequired: field.isRequired,
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
      const finalFieldIds = localFields.map((f) => idMap.get(f.id) ?? f.id);
      await reorderFields.mutateAsync(finalFieldIds);

      setIsDirty(false);
      setActiveFieldId(null);
    } catch {
      toast.error('일부 필드 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-3">
      <FormBuilderToolbar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localFields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {localFields.map((field) => (
              <FormFieldCard
                key={field.id}
                field={field}
                isActive={activeFieldId === field.id}
                onToggleActive={() => handleToggleActive(field.id)}
                onChange={(updates) => handleFieldChange(field.id, updates)}
                onDelete={() => handleDeleteField(field.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <AddFieldButton onClick={handleAddField} />
    </section>
  );
}
