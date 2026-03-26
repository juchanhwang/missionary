'use client';

import { InputField, Select, Switch } from '@samilhero/design-system';

import type { FormFieldDefinition } from 'apis/participation';

interface CustomFieldInputProps {
  field: FormFieldDefinition;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function CustomFieldInput({
  field,
  value,
  onChange,
  readOnly = false,
}: CustomFieldInputProps) {
  if (readOnly) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">
          {field.label}
          {field.isRequired && <span className="text-error-60 ml-0.5">*</span>}
        </label>
        <p className="text-sm text-gray-900">
          {value || <span className="text-xs text-gray-400">미입력</span>}
        </p>
      </div>
    );
  }

  switch (field.fieldType) {
    case 'TEXT':
      return (
        <InputField
          label={field.label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? undefined}
          required={field.isRequired}
        />
      );
    case 'TEXTAREA':
      return (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            {field.label}
            {field.isRequired && (
              <span className="text-error-60 ml-0.5">*</span>
            )}
          </label>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? undefined}
            rows={3}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-50 focus:outline-none"
          />
        </div>
      );
    case 'NUMBER':
      return (
        <InputField
          label={field.label}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? undefined}
          required={field.isRequired}
        />
      );
    case 'BOOLEAN':
      return (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-500">
            {field.label}
          </label>
          <Switch
            checked={value === 'true'}
            onChange={(e) => onChange(String(e.target.checked))}
          />
        </div>
      );
    case 'SELECT':
      return (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            {field.label}
            {field.isRequired && (
              <span className="text-error-60 ml-0.5">*</span>
            )}
          </label>
          <Select value={value} onChange={(v) => onChange(String(v ?? ''))}>
            <Select.Trigger>{value || '선택'}</Select.Trigger>
            <Select.Options>
              {(field.options ?? []).map((option) => (
                <Select.Option key={option} item={option}>
                  {option}
                </Select.Option>
              ))}
            </Select.Options>
          </Select>
        </div>
      );
    case 'DATE':
      return (
        <InputField
          label={field.label}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.isRequired}
        />
      );
    default:
      return null;
  }
}
