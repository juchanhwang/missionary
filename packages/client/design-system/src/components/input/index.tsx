'use client';

import IconInputError from '@assets/icons/icon-input-error.svg';
import IconInputReset from '@assets/icons/icon-input-reset.svg';
import { cn } from '@lib/utils';
import React from 'react';

import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  onReset?: () => void;
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({
  type = 'text',
  disabled,
  value,
  error,
  className,
  onReset,
  ref,
  ...rest
}: InputProps) {
  const hasValue =
    value !== undefined && value !== '' && String(value).length > 0;

  return (
    <div className={cn('flex flex-col w-full', className)}>
      <div
        className={cn(
          'flex w-full items-center gap-2 rounded-lg bg-gray-02 px-3 py-2 transition-colors',
          'focus-within:ring-1 focus-within:ring-ring focus-within:border-primary-50',
          disabled && 'cursor-not-allowed opacity-50 bg-gray-05',
          error &&
            'border-error-60 focus-within:border-error-60 focus-within:ring-error-60',
        )}
      >
        <input
          type={type}
          disabled={disabled}
          autoComplete="off"
          value={value}
          ref={ref}
          className="flex-1 border-0 bg-transparent text-sm placeholder:text-gray-30 focus:outline-none disabled:cursor-not-allowed"
          {...rest}
        />
        {error && <IconInputError className="shrink-0" />}
        {hasValue && onReset && !disabled && (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 flex items-center justify-center focus:outline-none"
            tabIndex={-1}
          >
            <IconInputReset className="cursor-pointer" />
          </button>
        )}
      </div>
      {error && <div className="mt-[5px] text-xs text-error-60">{error}</div>}
    </div>
  );
}
Input.displayName = 'Input';
