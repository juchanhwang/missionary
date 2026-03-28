'use client';

import { Lock } from 'lucide-react';

import { FieldPreviewInput } from './FormFieldCard';

interface LockedFieldCardProps {
  label: string;
  fieldType: string;
  isRequired: boolean;
  placeholder: string | null;
  selectOptions?: string[];
}

export function LockedFieldCard({
  label,
  fieldType,
  isRequired,
  placeholder,
  selectOptions,
}: LockedFieldCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          {isRequired && (
            <span className="text-red-600 font-bold text-sm">*</span>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            <Lock size={9} />
            고정
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold border bg-gray-100 text-gray-400 border-gray-200">
            {fieldType}
          </span>
        </div>
      </div>
      <FieldPreviewInput
        fieldType={fieldType}
        placeholder={placeholder}
        selectOptions={selectOptions}
      />
    </div>
  );
}
