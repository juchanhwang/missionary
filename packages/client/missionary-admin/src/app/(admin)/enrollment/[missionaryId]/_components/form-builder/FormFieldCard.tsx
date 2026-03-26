'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@samilhero/design-system';
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Lock,
  Trash2,
} from 'lucide-react';

import { FormFieldSettings, type LocalFormField } from './FormFieldSettings';

const FIELD_TYPE_LABELS: Record<string, string> = {
  TEXT: '텍스트',
  TEXTAREA: '긴 텍스트',
  NUMBER: '숫자',
  BOOLEAN: '예/아니오',
  SELECT: '선택',
  DATE: '날짜',
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

  const canDelete = !field.hasAnswers;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border transition-colors ${
        isActive
          ? 'border-l-2 border-l-blue-60 border-gray-200 bg-white'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* 미확장 (프리뷰) */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          className="cursor-grab text-gray-300 hover:text-gray-500"
          aria-label="순서 변경 핸들"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>

        <Badge variant="outline">
          {FIELD_TYPE_LABELS[field.fieldType] ?? field.fieldType}
        </Badge>

        <span className="flex-1 text-sm font-medium text-gray-900 truncate">
          {field.label}
        </span>

        <span
          className={`text-xs ${field.isRequired ? 'text-warning-70' : 'text-gray-400'}`}
        >
          {field.isRequired ? '*필수' : '선택'}
        </span>

        <button
          type="button"
          onClick={onToggleActive}
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          {isActive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {canDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-error-10 hover:text-error-60"
            aria-label="필드 삭제"
          >
            <Trash2 size={14} />
          </button>
        ) : (
          <span
            className="flex h-7 w-7 items-center justify-center text-gray-300"
            title="답변이 있는 필드는 삭제할 수 없습니다."
          >
            <Lock size={14} />
          </span>
        )}
      </div>

      {/* 확장 (편집 활성) */}
      {isActive && <FormFieldSettings field={field} onChange={onChange} />}
    </div>
  );
}
