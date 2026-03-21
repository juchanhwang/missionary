import IconInputReset from '@assets/icons/icon-input-reset.svg';
import { cn } from '@lib/utils';
import React, { useId } from 'react';

import { formSizeClasses } from '../form-size';

import type { FormSize } from '../form-size';
import type { InputHTMLAttributes } from 'react';

interface InputFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  label?: string;
  hideLabel?: boolean;
  error?: string;
  onClear?: () => void;
  size?: FormSize;
  ref?: React.Ref<HTMLInputElement>;
}

export function InputField({
  label,
  hideLabel = false,
  error,
  onClear,
  value,
  disabled,
  readOnly,
  className,
  id: providedId,
  size = 'md',
  ref,
  ...rest
}: InputFieldProps) {
  const generatedId = useId();
  const inputId = providedId ?? generatedId;
  const errorId = `${inputId}-error`;

  const hasValue = typeof value === 'string' ? value.length > 0 : !!value;
  const showClearButton = hasValue && !disabled && onClear;
  const sizeClass = formSizeClasses[size];

  return (
    <div className={cn('relative flex flex-col', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'mb-1 text-xs font-normal leading-[1.833] text-gray-700',
            hideLabel && 'sr-only',
          )}
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex w-full items-center rounded-lg border border-gray-200 bg-gray-50 transition-colors',
          sizeClass.container,
          'focus-within:ring-1 focus-within:ring-gray-400 focus-within:border-gray-400',
          disabled &&
            'cursor-not-allowed opacity-50 bg-gray-100 border-gray-100',
          !disabled && !readOnly && 'hover:border-gray-300',
          error &&
            'border-error-60 focus-within:border-error-60 focus-within:ring-error-60',
        )}
      >
        <input
          id={inputId}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          ref={ref}
          className={cn(
            'flex-1 border-0 bg-transparent text-black leading-[1.428] focus:outline-none placeholder:text-gray-400 disabled:cursor-not-allowed',
            sizeClass.text,
          )}
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
            <IconInputReset
              className="cursor-pointer"
              style={{ width: sizeClass.icon, height: sizeClass.icon }}
            />
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
