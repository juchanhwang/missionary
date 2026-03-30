'use client';

import { Select, Switch } from '@samilhero/design-system';

import { SelectOptionsEditor } from './SelectOptionsEditor';

import type { FormFieldType } from 'apis/formField';

interface LocalFormField {
  id: string;
  fieldType: FormFieldType;
  label: string;
  placeholder: string | null;
  isRequired: boolean;
  options: string[] | null;
}

interface FormFieldSettingsProps {
  field: LocalFormField;
  onChange: (updates: Partial<LocalFormField>) => void;
}

const FIELD_TYPE_OPTIONS: { value: FormFieldType; label: string }[] = [
  { value: 'TEXT', label: '텍스트' },
  { value: 'TEXTAREA', label: '긴 텍스트' },
  { value: 'NUMBER', label: '숫자' },
  { value: 'BOOLEAN', label: '예/아니오' },
  { value: 'SELECT', label: '선택' },
  { value: 'DATE', label: '날짜' },
];

export type { LocalFormField };

export function FormFieldSettings({ field, onChange }: FormFieldSettingsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* 필드 유형 */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-gray-500 w-16 shrink-0">
          필드 유형
        </label>
        <Select
          value={field.fieldType}
          onChange={(v) =>
            onChange({ fieldType: (v as FormFieldType) ?? 'TEXT' })
          }
        >
          <Select.Trigger>
            {FIELD_TYPE_OPTIONS.find((o) => o.value === field.fieldType)
              ?.label ?? '텍스트'}
          </Select.Trigger>
          <Select.Options>
            {FIELD_TYPE_OPTIONS.map((option) => (
              <Select.Option key={option.value} item={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select.Options>
        </Select>
      </div>

      {/* 선택지 (SELECT 타입) */}
      {field.fieldType === 'SELECT' && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">선택지</label>
          <SelectOptionsEditor
            values={field.options ?? []}
            onChange={(options) => onChange({ options })}
          />
        </div>
      )}

      {/* 필수 항목 토글 */}
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
        <div>
          <p className="text-sm font-medium text-gray-900">필수 항목</p>
          <p className="text-xs text-gray-400 mt-0.5">
            응답자가 반드시 입력해야 합니다
          </p>
        </div>
        <Switch
          checked={field.isRequired}
          onChange={(e) => onChange({ isRequired: e.target.checked })}
        />
      </div>
    </div>
  );
}
