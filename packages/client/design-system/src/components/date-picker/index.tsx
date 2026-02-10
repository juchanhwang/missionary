'use client';

import classnames from 'classnames';
import React, { useId } from 'react';
import ReactDatePicker from 'react-datepicker';

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
  onBlur,
  ref,
  ...rest
}: DatePickerProps) {
  const generatedId = useId();
  const inputId = providedId ?? generatedId;
  const errorId = `${inputId}-error`;

  const dateValue = value ?? selected;

  return (
    <div className={classnames('relative flex flex-col', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className={classnames(
            'mb-1 text-xs font-normal leading-[1.833] text-gray-70',
            hideLabel && 'sr-only',
          )}
        >
          {label}
        </label>
      )}
      <div
        className={classnames(
          'flex h-12 items-center gap-2.5 pt-[14px] pb-[14px] pl-4 pr-4 rounded-lg',
          disabled ? 'bg-gray-05' : 'bg-gray-02',
        )}
      >
        <ReactDatePicker
          id={inputId}
          selected={dateValue}
          onChange={onChange as any}
          placeholderText={placeholder}
          disabled={disabled}
          name={name}
          onBlur={onBlur}
          className="w-full border-0 bg-transparent text-black text-sm leading-[1.428] focus:outline-none placeholder:text-gray-30 disabled:text-primary-30"
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
