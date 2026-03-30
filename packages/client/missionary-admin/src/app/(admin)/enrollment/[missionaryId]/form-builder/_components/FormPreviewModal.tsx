'use client';

import { Button } from '@samilhero/design-system';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import Modal from 'react-modal';

import type { LocalFormField } from './FormFieldSettings';

interface LockedFieldDef {
  label: string;
  fieldType: string;
  isRequired: boolean;
  placeholder: string | null;
  selectOptions?: string[];
}

interface FormPreviewModalProps {
  isOpen: boolean;
  close: () => void;
  missionName: string;
  subtitle: string;
  lockedFields: LockedFieldDef[];
  customFields: LocalFormField[];
}

function PreviewInput({
  fieldType,
  placeholder,
  isRequired,
  label,
  description,
  selectOptions,
}: {
  fieldType: string;
  placeholder: string | null;
  isRequired: boolean;
  label: string;
  description?: string | null;
  selectOptions?: string[];
}) {
  const labelEl = (
    <div className="mb-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {isRequired && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
  );

  const inputClass =
    'w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400';

  switch (fieldType) {
    case 'TEXTAREA':
      return (
        <div>
          {labelEl}
          <textarea
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 resize-none h-[72px]"
            placeholder={placeholder || '내용을 입력하세요'}
          />
        </div>
      );
    case 'NUMBER':
      return (
        <div>
          {labelEl}
          <input
            type="number"
            className={inputClass}
            placeholder={placeholder || '0'}
          />
        </div>
      );
    case 'SELECT':
      return (
        <div>
          {labelEl}
          <select className={`${inputClass} appearance-auto`}>
            <option value="">{placeholder || '선택하세요'}</option>
            {selectOptions?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    case 'BOOLEAN':
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 accent-gray-800 cursor-pointer"
          />
          <label className="text-sm font-medium text-gray-700">{label}</label>
        </div>
      );
    case 'DATE':
      return (
        <div>
          {labelEl}
          <input
            type="text"
            className={inputClass}
            placeholder={placeholder || 'YYYY-MM-DD'}
          />
        </div>
      );
    default:
      return (
        <div>
          {labelEl}
          <input
            type="text"
            className={inputClass}
            placeholder={placeholder || '텍스트를 입력하세요'}
          />
        </div>
      );
  }
}

export function FormPreviewModal({
  isOpen,
  close,
  missionName,
  subtitle,
  lockedFields,
  customFields,
}: FormPreviewModalProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body');
    }
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={close}
      contentLabel="신청 폼 미리보기"
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
    >
      <div className="relative flex flex-col bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh]">
        {/* 헤더 */}
        <div className="shrink-0 overflow-clip rounded-t-2xl">
          <div className="h-2 bg-red-600" />
          <div className="flex items-start justify-between px-6 pt-5 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {missionName} 신청 폼
              </h2>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={close}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              aria-label="닫기"
            >
              <X size={18} />
            </button>
          </div>
          <div className="mx-6 h-px bg-gray-100" />
        </div>

        {/* 본문 (스크롤) */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4">
            {/* 고정 필드 */}
            {lockedFields.map((field) => (
              <PreviewInput
                key={field.label}
                fieldType={field.fieldType}
                placeholder={field.placeholder}
                isRequired={field.isRequired}
                label={field.label}
                selectOptions={field.selectOptions}
              />
            ))}

            {/* 커스텀 필드 */}
            {customFields.length > 0 && (
              <>
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">추가 정보</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                {customFields.map((field) => (
                  <PreviewInput
                    key={field.id}
                    fieldType={field.fieldType}
                    placeholder={null}
                    isRequired={field.isRequired}
                    label={field.label || '(라벨 없음)'}
                    description={field.placeholder}
                    selectOptions={field.options ?? undefined}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="shrink-0 flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-xs text-gray-400">
            * 미리보기입니다. 실제 제출은 되지 않습니다.
          </p>
          <Button variant="filled" color="neutral" size="sm" onClick={close}>
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
