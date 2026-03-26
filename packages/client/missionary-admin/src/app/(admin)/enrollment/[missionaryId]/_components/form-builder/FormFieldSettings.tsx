'use client';

import { InputField, Select, Switch } from '@samilhero/design-system';

import { TagInput } from './TagInput';

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
    <div className="space-y-4 p-4 bg-blue-10/30 rounded-b-xl">
      <InputField
        label="라벨"
        value={field.label}
        onChange={(e) => onChange({ label: e.target.value })}
        placeholder="필드 라벨"
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">필드 타입</label>
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
      <InputField
        label="플레이스홀더"
        value={field.placeholder ?? ''}
        onChange={(e) => onChange({ placeholder: e.target.value || null })}
        placeholder="입력 안내 문구 (선택)"
      />
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-500">필수 입력</label>
        <Switch
          checked={field.isRequired}
          onChange={(e) => onChange({ isRequired: e.target.checked })}
        />
      </div>
      {field.fieldType === 'SELECT' && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">선택지</label>
          <TagInput
            values={field.options ?? []}
            onChange={(options) => onChange({ options })}
          />
        </div>
      )}
    </div>
  );
}
