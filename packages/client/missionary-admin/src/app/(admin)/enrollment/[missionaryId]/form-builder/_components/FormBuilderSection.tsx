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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { overlay } from '@samilhero/design-system';
import { Info } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AddFieldButton } from './AddFieldButton';
import { AttendanceFieldCard } from './AttendanceFieldCard';
import { FormBuilderToolbar } from './FormBuilderToolbar';
import { FormFieldCard } from './FormFieldCard';
import { FormPreviewModal } from './FormPreviewModal';
import { LockedFieldCard } from './LockedFieldCard';
import { useGetAttendanceOptions } from '../../_hooks/useGetAttendanceOptions';
import { useBeforeUnloadGuard } from '../_hooks/useBeforeUnloadGuard';
import { useFormSave } from '../_hooks/useFormSave';
import { useGetFormFields } from '../_hooks/useGetFormFields';
import { useLocalFields } from '../_hooks/useLocalFields';

import type { EnrollmentMissionSummary } from 'apis/enrollment';

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
    label: '주민등록번호',
    fieldType: 'TEXT',
    isRequired: true,
    placeholder: '주민등록번호를 입력하세요',
  },
  {
    label: '소속',
    fieldType: 'TEXT',
    isRequired: true,
    placeholder: '소속을 입력하세요',
  },
];

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

interface FormBuilderSectionProps {
  mission: EnrollmentMissionSummary;
}

export function FormBuilderSection({ mission }: FormBuilderSectionProps) {
  const missionaryId = mission.id;

  // --- 데이터 소스 ---
  const { data: serverFields = [] } = useGetFormFields({ missionaryId });
  const { data: attendanceOptions = [] } = useGetAttendanceOptions({
    missionaryId,
  });

  // --- 로컬 필드 버퍼 ---
  const {
    localFields,
    isDirty,
    addField,
    deleteField,
    changeField,
    reorderFields,
    resetDirty,
  } = useLocalFields(serverFields);

  // --- UI 포커스 ---
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  // --- 저장 ---
  const { save, isSaving } = useFormSave({
    localFields,
    serverFields,
    missionaryId,
    onValidationError: (fieldId, message) => {
      setActiveFieldId(fieldId);
      toast.error(message);
    },
    onSuccess: () => {
      resetDirty();
      setActiveFieldId(null);
    },
    onError: () => {
      resetDirty();
    },
  });

  // --- 브라우저 가드 ---
  useBeforeUnloadGuard(isDirty);

  // --- DnD ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // --- 파생 값 ---
  const subtitleParts = [
    mission.missionGroupName,
    formatPeriod(mission.missionStartDate, mission.missionEndDate),
  ].filter(Boolean);

  // --- 조합 핸들러 ---
  const handleAddField = () => {
    const newField = addField();
    setActiveFieldId(newField.id);
  };

  const handleDeleteField = (id: string) => {
    deleteField(id);
    if (activeFieldId === id) {
      setActiveFieldId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderFields(active.id as string, over.id as string);
  };

  const handleToggleActive = (id: string) => {
    setActiveFieldId((prev) => (prev === id ? null : id));
  };

  const handlePreview = () => {
    const attendanceOptionLabels = attendanceOptions.map((opt) => opt.label);
    const lockedFieldsWithOptions = [
      ...LOCKED_FIELDS.map((f) => ({ ...f, selectOptions: undefined })),
      {
        label: '참석 일정',
        fieldType: 'SELECT',
        isRequired: true,
        placeholder: null,
        selectOptions: attendanceOptionLabels,
      },
    ];

    overlay.open(({ isOpen, close, unmount }) => (
      <FormPreviewModal
        isOpen={isOpen}
        close={() => {
          close();
          setTimeout(unmount, 300);
        }}
        missionName={mission.name}
        subtitle={subtitleParts.join(' · ')}
        lockedFields={lockedFieldsWithOptions}
        customFields={localFields}
      />
    ));
  };

  return (
    <>
      {/* 스티키 툴바 */}
      <FormBuilderToolbar
        mission={mission}
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={save}
        onPreview={handlePreview}
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
            />
          ))}

          {/* 참석 일정 (고정 필드 — 옵션 관리 가능) */}
          <AttendanceFieldCard
            missionaryId={missionaryId}
            attendanceOptions={attendanceOptions}
          />

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
                  onChange={(updates) => changeField(field.id, updates)}
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
