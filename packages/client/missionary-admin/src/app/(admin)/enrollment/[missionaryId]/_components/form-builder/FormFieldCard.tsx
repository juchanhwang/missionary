'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { overlay } from '@samilhero/design-system';
import { PANEL_TRANSITION_MS } from 'components/ui/SidePanel';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';

import { DeleteFieldConfirmModal } from './DeleteFieldConfirmModal';
import { FormFieldSettings, type LocalFormField } from './FormFieldSettings';

const FIELD_TYPE_BADGE_STYLES: Record<string, string> = {
  TEXT: 'bg-gray-100 text-gray-400 border-gray-200',
  TEXTAREA: 'bg-gray-100 text-gray-400 border-gray-200',
  NUMBER: 'bg-warning-10 text-warning-70 border-warning-70',
  BOOLEAN: 'bg-gray-100 text-gray-400 border-gray-200',
  SELECT: 'bg-blue-10 text-blue-60 border-blue-60',
  DATE: 'bg-gray-100 text-gray-400 border-gray-200',
};

interface FormFieldCardProps {
  field: LocalFormField & {
    hasAnswers: boolean;
    isNew?: boolean;
  };
  isActive: boolean;
  onToggleActive: () => void;
  onChange: (updates: Partial<LocalFormField>) => void;
  onDelete: () => void;
}

export function FieldPreviewInput({
  fieldType,
  placeholder,
  selectOptions,
}: {
  fieldType: string;
  placeholder: string | null;
  selectOptions?: string[];
}) {
  const baseClass =
    'pointer-events-none border border-gray-200 rounded-lg text-sm text-gray-400 bg-white outline-none';

  switch (fieldType) {
    case 'TEXTAREA':
      return (
        <textarea
          className={`${baseClass} w-full h-[72px] px-3 py-2 resize-none`}
          placeholder={placeholder || '내용을 입력하세요'}
          readOnly
          tabIndex={-1}
        />
      );
    case 'NUMBER':
      return (
        <input
          type="number"
          className={`${baseClass} w-[120px] h-9 px-3`}
          placeholder={placeholder || '0'}
          readOnly
          tabIndex={-1}
        />
      );
    case 'SELECT':
      return (
        <select
          className={`${baseClass} w-full h-9 px-3 appearance-auto`}
          tabIndex={-1}
        >
          <option>{placeholder || '선택하세요'}</option>
          {selectOptions?.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      );
    case 'BOOLEAN':
      return (
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="w-9 h-5 rounded-full bg-gray-200 p-0.5">
            <div className="w-4 h-4 rounded-full bg-white" />
          </div>
        </div>
      );
    case 'DATE':
      return (
        <input
          type="text"
          className={`${baseClass} w-[160px] h-9 px-3`}
          placeholder={placeholder || 'YYYY-MM-DD'}
          readOnly
          tabIndex={-1}
        />
      );
    default:
      return (
        <input
          type="text"
          className={`${baseClass} w-full h-9 px-3`}
          placeholder={placeholder || '텍스트를 입력하세요'}
          readOnly
          tabIndex={-1}
        />
      );
  }
}

export function FormFieldCard({
  field,
  isActive,
  onToggleActive,
  onChange,
  onDelete,
}: FormFieldCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async () => {
    if (!field.hasAnswers) {
      onDelete();
      return;
    }

    const confirmed = await overlay.openAsync<boolean>(
      ({ isOpen, close, unmount }) => (
        <DeleteFieldConfirmModal
          isOpen={isOpen}
          close={(result) => {
            close(result);
            setTimeout(unmount, PANEL_TRANSITION_MS);
          }}
        />
      ),
    );

    if (confirmed) {
      onDelete();
    }
  };

  const badgeStyle =
    FIELD_TYPE_BADGE_STYLES[field.fieldType] ?? FIELD_TYPE_BADGE_STYLES.TEXT;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border border-gray-200 transition-all bg-white ${
        isActive
          ? 'border-l-4 border-l-blue-60 shadow-[0_4px_16px_rgba(37,99,235,0.08)]'
          : 'hover:border-gray-400 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
      }`}
    >
      {/* 드래그 핸들 (카드 좌측 바깥) */}
      <div
        className="absolute -left-6 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} className="text-gray-400" />
      </div>

      <div className={`px-5 ${isActive ? 'pt-4 pb-0' : 'py-4'}`}>
        {/* 헤더: 라벨 + 타입 뱃지 + 필수 표시 + 액션 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isActive ? (
              <input
                type="text"
                value={field.label}
                onChange={(e) => onChange({ label: e.target.value })}
                className="text-sm font-semibold text-gray-900 border-b-2 border-blue-200 bg-transparent outline-none px-0.5 py-px focus:border-blue-60"
                placeholder="필드 라벨"
              />
            ) : (
              <span className="text-sm font-semibold text-gray-900">
                {field.label || '(라벨 없음)'}
              </span>
            )}
            {field.isRequired && (
              <span className="text-red-600 font-bold text-sm">*</span>
            )}
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold border ${badgeStyle}`}
            >
              {field.fieldType}
            </span>
          </div>
          <div
            className={`flex items-center gap-1 ${
              isActive ? '' : 'opacity-0 group-hover:opacity-100'
            } transition-opacity`}
          >
            {!isActive && (
              <button
                type="button"
                onClick={onToggleActive}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                aria-label="필드 편집"
              >
                <Pencil size={13} />
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
              aria-label="필드 삭제"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* 프리뷰 인풋 */}
        <FieldPreviewInput
          fieldType={field.fieldType}
          placeholder={field.placeholder}
        />

        {/* 응답 정보 (view 상태에서만) */}
        {!isActive && !field.isNew && !field.hasAnswers && (
          <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
            응답 없음 · 삭제 가능
          </p>
        )}
      </div>

      {/* 설정 영역 (active 시만 표시) */}
      {isActive && (
        <div className="mt-4 border-t border-gray-100 px-5 py-4">
          <FormFieldSettings field={field} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
