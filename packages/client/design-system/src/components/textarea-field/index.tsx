import { cn } from '@lib/utils';
import React, { useId, useLayoutEffect, useRef } from 'react';

import { textareaSizeClasses } from '../form-size';

import type { FormSize } from '../form-size';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaFieldProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'size'
> {
  label?: string;
  hideLabel?: boolean;
  error?: string;
  size?: FormSize;
  maxLength?: number;
  showCount?: boolean;
  resize?: 'none' | 'vertical' | 'both';
  autoResize?: boolean;
  ref?: React.Ref<HTMLTextAreaElement>;
}

const resizeClasses = {
  none: 'resize-none',
  vertical: 'resize-y',
  both: 'resize',
} as const;

function applyAutoHeight(el: HTMLTextAreaElement) {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

export function TextareaField({
  label,
  hideLabel = false,
  error,
  size = 'md',
  rows = 3,
  maxLength,
  showCount = false,
  resize = 'vertical',
  autoResize = false,
  value,
  disabled,
  readOnly,
  className,
  id: providedId,
  onChange,
  ref,
  ...rest
}: TextareaFieldProps) {
  const generatedId = useId();
  const textareaId = providedId ?? generatedId;
  const errorId = `${textareaId}-error`;
  const counterId = `${textareaId}-counter`;
  const internalRef = useRef<HTMLTextAreaElement>(null);

  const sizeClass = textareaSizeClasses[size];
  const currentLength = String(value ?? '').length;
  const isOverLimit = maxLength != null && currentLength > maxLength;
  const showCounter = showCount || maxLength != null;
  const hasFooter = !!error || showCounter;

  if (process.env.NODE_ENV !== 'production') {
    if ((showCount || maxLength != null) && value === undefined) {
      console.warn(
        'TextareaField: showCount/maxLength는 controlled 모드(value prop)에서만 정확하게 동작합니다.',
      );
    }
  }

  useLayoutEffect(() => {
    if (autoResize && internalRef.current) {
      applyAutoHeight(internalRef.current);
    }
  }, [autoResize, value]);

  const setRefs = (el: HTMLTextAreaElement | null) => {
    internalRef.current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref) {
      (ref as React.RefObject<HTMLTextAreaElement | null>).current = el;
    }
  };

  const describedByIds = [
    error ? errorId : null,
    showCounter ? counterId : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn('relative flex flex-col', className)}>
      {label && (
        <label
          htmlFor={textareaId}
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
          'flex w-full rounded-lg border border-gray-200 bg-gray-50 transition-colors',
          sizeClass.container,
          'focus-within:ring-1 focus-within:ring-gray-400 focus-within:border-gray-400',
          disabled &&
            'cursor-not-allowed opacity-50 bg-gray-100 border-gray-100',
          !disabled && !readOnly && 'hover:border-gray-300',
          error &&
            'border-error-60 focus-within:border-error-60 focus-within:ring-error-60',
        )}
      >
        <textarea
          id={textareaId}
          value={value}
          rows={rows}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={!!error}
          aria-describedby={describedByIds || undefined}
          ref={setRefs}
          onChange={onChange}
          className={cn(
            'flex-1 border-0 bg-transparent text-black leading-[1.428] focus:outline-none placeholder:text-gray-400',
            'disabled:cursor-not-allowed',
            readOnly && 'cursor-default',
            sizeClass.text,
            autoResize ? 'resize-none' : resizeClasses[resize],
          )}
          {...rest}
        />
      </div>
      {hasFooter && (
        <div className="mt-1 flex items-start justify-between gap-2">
          {error ? (
            <div
              id={errorId}
              role="alert"
              className="text-error-60 text-xs leading-[1.5]"
            >
              {error}
            </div>
          ) : (
            <div />
          )}
          {showCounter && (
            <span
              id={counterId}
              className={cn(
                'shrink-0 text-xs',
                isOverLimit ? 'text-error-60' : 'text-gray-400',
              )}
            >
              {maxLength != null
                ? `${currentLength} / ${maxLength}`
                : currentLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
TextareaField.displayName = 'TextareaField';
