import IconInputReset from '@assets/icons/icon-input-reset.svg';
import { cn } from '@lib/utils';
import React, { useId } from 'react';

import type { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hideLabel?: boolean;
  error?: string;
  onClear?: () => void;
  ref?: React.Ref<HTMLInputElement>;
}

export function InputField({
  label,
  hideLabel = false,
  error,
  onClear,
  value,
  disabled,
  className,
  id: providedId,
  ref,
  ...rest
}: InputFieldProps) {
  const generatedId = useId();
  const inputId = providedId ?? generatedId;
  const errorId = `${inputId}-error`;

  const hasValue = typeof value === 'string' ? value.length > 0 : !!value;
  const showClearButton = hasValue && !disabled && onClear;

  return (
    <div className={cn('relative flex flex-col', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'mb-1 text-xs font-normal leading-[1.833] text-gray-70',
            hideLabel && 'sr-only',
          )}
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex w-full items-center gap-2 rounded-lg bg-gray-10 px-3 py-2 transition-colors',
          'focus-within:ring-1 focus-within:ring-gray-40 focus-within:border-gray-40',
          disabled && 'cursor-not-allowed opacity-50 bg-gray-20',
          !disabled && 'hover:bg-gray-20',
          error &&
            'border-error-60 focus-within:border-error-60 focus-within:ring-error-60',
        )}
      >
        <input
          id={inputId}
          value={value}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          ref={ref}
          className="flex-1 border-0 bg-transparent text-black text-sm leading-[1.428] focus:outline-none placeholder:text-gray-30 disabled:cursor-not-allowed"
          {...rest}
        />
        {showClearButton && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 flex items-center justify-center focus:outline-none"
            aria-label="입력 내용 지우기"
            tabIndex={-1}
          >
            <IconInputReset className="w-5 h-5 cursor-pointer" />
          </button>
        )}
      </div>
      {error && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          className="mt-1 text-error-60 text-xs leading-[1.5]"
        >
          {error}
        </div>
      )}
    </div>
  );
}
InputField.displayName = 'InputField';
