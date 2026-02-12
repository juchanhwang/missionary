'use client';

import IconInputError from '@assets/icons/icon-input-error.svg';
import IconInputReset from '@assets/icons/icon-input-reset.svg';
import { cn } from '@lib/utils';
import React from 'react';

import { formSizeClasses } from '../form-size';

import type { FormSize } from '../form-size';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  error?: string;
  onReset?: () => void;
  size?: FormSize;
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({
  type = 'text',
  disabled,
  value,
  error,
  className,
  onReset,
  size = 'md',
  ref,
  ...rest
}: InputProps) {
  const hasValue =
    value !== undefined && value !== '' && String(value).length > 0;
  const sizeClass = formSizeClasses[size];

  return (
    <div className={cn('flex flex-col w-full', className)}>
      <div
        className={cn(
          'flex w-full items-center rounded-lg border border-gray-30 bg-gray-10 transition-colors',
          sizeClass.container,
          'focus-within:ring-1 focus-within:ring-gray-50 focus-within:border-gray-50',
          disabled && 'cursor-not-allowed opacity-50 bg-gray-20 border-gray-20',
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
          className={cn(
            'flex-1 border-0 bg-transparent placeholder:text-gray-50 focus:outline-none disabled:cursor-not-allowed',
            sizeClass.text,
          )}
          {...rest}
        />
        {error && (
          <IconInputError
            className="shrink-0"
            style={{ width: sizeClass.icon, height: sizeClass.icon }}
          />
        )}
        {hasValue && onReset && !disabled && (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 flex items-center justify-center focus:outline-none"
            tabIndex={-1}
          >
            <IconInputReset
              className="cursor-pointer"
              style={{ width: sizeClass.icon, height: sizeClass.icon }}
            />
          </button>
        )}
      </div>
      {error && <div className="mt-[5px] text-xs text-error-60">{error}</div>}
    </div>
  );
}
Input.displayName = 'Input';
