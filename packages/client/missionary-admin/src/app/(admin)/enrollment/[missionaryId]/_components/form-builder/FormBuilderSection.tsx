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
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'lib/queryKeys';
import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AddFieldButton } from './AddFieldButton';
import { FormBuilderToolbar } from './FormBuilderToolbar';
import { FormFieldCard } from './FormFieldCard';
import { LockedFieldCard } from './LockedFieldCard';
import {
  useCreateFormField,
  useDeleteFormField,
  useReorderFormFields,
  useUpdateFormField,
} from '../../_hooks/useFormFieldMutations';
import { useGetAttendanceOptions } from '../../_hooks/useGetAttendanceOptions';
import { useGetFormFields } from '../../_hooks/useGetFormFields';

import type { LocalFormField } from './FormFieldSettings';
import type { EnrollmentMissionSummary } from 'apis/enrollment';
import type { FormFieldType } from 'apis/formField';

interface LocalFormFieldWithMeta extends LocalFormField {
  hasAnswers: boolean;
  isNew?: boolean;
}

interface LockedField {
  label: string;
  fieldType: string;
  isRequired: boolean;
  placeholder: string | null;
}

const LOCKED_FIELDS: LockedField[] = [
  {
    label: '이름',
    fieldType: 'TEXT',
    isRequired: true,
    placeholder: '이름을 입력하세요',
  },
  {
    label: '생년월일',
    fieldType: 'DATE',
    isRequired: true,
    placeholder: 'YYYY-MM-DD',
  },
  {
    label: '소속',
    fieldType: 'TEXT',
    isRequired: true,
    placeholder: '소속을 입력하세요',
  },
  {
    label: '참석 일정',
    fieldType: 'SELECT',
    isRequired: true,
    placeholder: '참석 일정을 선택하세요',
  },
  { label: '기수', fieldType: 'NUMBER', isRequired: true, placeholder: '0' },
  {
    label: '과거 참여 여부',
    fieldType: 'BOOLEAN',
    isRequired: false,
    placeholder: null,
  },
  {
    label: '대학생 여부',
    fieldType: 'BOOLEAN',
    isRequired: false,
    placeholder: null,
  },
];

interface FormBuilderSectionProps {
  mission: EnrollmentMissionSummary;
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

function formatPeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sy = s.getFullYear();
  const sm = String(s.getMonth() + 1).padStart(2, '0');
  const sd = String(s.getDate()).padStart(2, '0');
  const em = String(e.getMonth() + 1).padStart(2, '0');
  const ed = String(e.getDate()).padStart(2, '0');

  if (s.getFullYear() === e.getFullYear()) {
    return `${sy}.${sm}.${sd} ~ ${em}.${ed}`;
  }
  return `${sy}.${sm}.${sd} ~ ${e.getFullYear()}.${em}.${ed}`;
}

export function FormBuilderSection({ mission }: FormBuilderSectionProps) {
  const missionaryId = mission.id;
  const queryClient = useQueryClient();
  const { data: serverFields = [] } = useGetFormFields({ missionaryId });
  const { data: attendanceOptions = [] } = useGetAttendanceOptions({
    missionaryId,
  });

  const attendanceOptionLabels = attendanceOptions.map((opt) => opt.label);

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

      setIsDirty(false);
      setActiveFieldId(null);
    } catch {
      // 부분 성공 상태를 서버와 재동기화
      await queryClient.invalidateQueries({
        queryKey: queryKeys.formFields.list(missionaryId),
      });
      setIsDirty(false);
      toast.error(
        '일부 필드 저장에 실패했습니다. 서버 상태를 다시 불러옵니다.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const subtitleParts = [
    mission.missionGroupName,
    formatPeriod(mission.missionStartDate, mission.missionEndDate),
  ].filter(Boolean);

  return (
    <>
      {/* 스티키 툴바 (브레드크럼 + 제목 + 저장) */}
      <FormBuilderToolbar
        mission={mission}
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
      />

      {/* 폼 빌더 콘텐츠 */}
      <div className="flex flex-col items-center px-8 py-8 pb-16">
        <div className="w-full max-w-2xl flex flex-col gap-3">
          {/* 폼 헤더 카드 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-clip">
            <div className="h-2 bg-red-600" />
            <div className="px-6 py-5">
              <h1 className="text-xl font-bold text-gray-900">
                {mission.name} 신청 폼
              </h1>
              {subtitleParts.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {subtitleParts.join(' · ')}
                </p>
              )}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                <Info size={12} />
                <span>
                  * 표시 항목은 필수 입력입니다 · 고정 필드는 시스템 기본
                  제공으로 순서 변경 및 삭제가 불가합니다
                </span>
              </div>
            </div>
          </div>

          {/* 고정 필드 (시스템 기본) */}
          {LOCKED_FIELDS.map((field) => (
            <LockedFieldCard
              key={field.label}
              label={field.label}
              fieldType={field.fieldType}
              isRequired={field.isRequired}
              placeholder={field.placeholder}
              selectOptions={
                field.label === '참석 일정' ? attendanceOptionLabels : undefined
              }
            />
          ))}

          {/* 구분선 */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-medium text-gray-400">
              커스텀 필드
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* 커스텀 필드 카드 목록 */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localFields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
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
            </SortableContext>
          </DndContext>

          {/* 필드 추가 버튼 */}
          <AddFieldButton onClick={handleAddField} />
        </div>
      </div>
    </>
  );
}
