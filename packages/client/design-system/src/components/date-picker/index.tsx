'use client';

import { cn } from '@lib/utils';
import React, { useId } from 'react';
import ReactDatePicker from 'react-datepicker';

import { formSizeClasses } from '../form-size';

import type { FormSize } from '../form-size';

import 'react-datepicker/dist/react-datepicker.css';
import './DatePickerStyles.css';

export interface DatePickerProps {
  label?: string;
  hideLabel?: boolean;
  error?: string;
  selected?: Date | null;
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  size?: FormSize;
  onBlur?: () => void;
  ref?: React.Ref<HTMLInputElement>;
  // Range & Common props
  startDate?: Date | null;
  endDate?: Date | null;
  selectsStart?: boolean;
  selectsEnd?: boolean;
  minDate?: Date | undefined;
  maxDate?: Date | undefined;
  dateFormat?: string;
  showTimeSelect?: boolean;
  timeFormat?: string;
  timeIntervals?: number;
  timeCaption?: string;
  isClearable?: boolean;
}

export function DatePicker({
  label,
  hideLabel = false,
  error,
  selected,
  value,
  onChange,
  placeholder,
  disabled,
  className,
  id: providedId,
  name,
  size = 'md',
  onBlur,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref,
  ...rest
}: DatePickerProps) {
  const generatedId = useId();
  const inputId = providedId ?? generatedId;
  const errorId = `${inputId}-error`;

  const dateValue = value ?? selected;
  const sizeClass = formSizeClasses[size];

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
          'flex w-full items-center rounded-lg border border-gray-30 bg-gray-10 transition-colors',
          sizeClass.container,
          'focus-within:ring-1 focus-within:ring-gray-50 focus-within:border-gray-50',
          disabled && 'cursor-not-allowed opacity-50 bg-gray-20 border-gray-20',
          !disabled && 'hover:border-gray-40',
          error &&
            'border-error-60 focus-within:border-error-60 focus-within:ring-error-60',
        )}
      >
        <ReactDatePicker
          id={inputId}
          selected={dateValue}
          onChange={(date: Date | null) => onChange(date)}
          placeholderText={placeholder}
          disabled={disabled}
          name={name}
          onBlur={onBlur}
          className={cn(
            'w-full border-0 bg-transparent text-black leading-[1.428] focus:outline-none placeholder:text-gray-50 disabled:cursor-not-allowed',
            sizeClass.text,
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
          dateFormat="yyyy-MM-dd"
          {...rest}
        />
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
DatePicker.displayName = 'DatePicker';
