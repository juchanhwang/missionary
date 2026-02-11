'use client';

import { useControllableState, useMergeRefs } from '@hooks';
import { cn } from '@lib/utils';
import React, { useContext, createContext, useMemo, useRef } from 'react';

import { CheckboxGroupActionsContext } from '../checkbox-group/checkboxGroupContext';

export const CheckboxActionsContext = createContext<{
  onChange: (checked: boolean) => void;
} | null>(null);
CheckboxActionsContext.displayName = 'CheckboxActionsContext';

export const CheckboxDataContext = createContext<{
  checked: boolean;
} | null>(null);
CheckboxDataContext.displayName = 'CheckboxDataContext';

interface CheckboxProps extends Omit<
  React.HTMLProps<HTMLInputElement>,
  'onChange'
> {
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  label?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export function Checkbox({
  defaultChecked = false,
  checked: controlledChecked,
  onChange: controlledOnChange,
  value,
  disabled,
  className,
  children,
  label,
  name,
  ref,
  ...props
}: CheckboxProps) {
  const groupActions = useContext(CheckboxGroupActionsContext);
  const internalRef = useRef<HTMLInputElement>(null);

  const [checked, onChange] = useControllableState<boolean>(
    controlledChecked,
    undefined,
    defaultChecked,
  );

  const mergedRef = useMergeRefs(ref, internalRef);

  const actions = useMemo(
    () => ({
      onChange,
    }),
    [onChange],
  );
  const data = useMemo(
    () => ({
      checked,
    }),
    [checked],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    onChange(newChecked);
    controlledOnChange?.(e);
    if (value && groupActions) {
      groupActions.updateCheckedValue?.(value);
    }
  };

  const handleClick = () => {
    internalRef.current?.click();
  };

  const defaultVisual = !children && (
    <label
      className={cn(
        'inline-flex items-center gap-2',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      )}
    >
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
          checked ? 'border-gray-80 bg-gray-80' : 'border-gray-40 bg-white',
        )}
      >
        {checked && (
          <svg
            className="h-3 w-3 text-white"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.5 6L5 8.5L9.5 3.5" />
          </svg>
        )}
      </span>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );

  return (
    <CheckboxActionsContext.Provider value={actions}>
      <CheckboxDataContext.Provider value={data}>
        <input
          type="checkbox"
          role="checkbox"
          ref={mergedRef}
          checked={checked}
          value={value}
          disabled={disabled}
          name={name}
          className="sr-only"
          onChange={handleInputChange}
        />
        <div
          className={className}
          onClick={disabled ? undefined : handleClick}
          {...props}
        >
          {children || defaultVisual}
        </div>
      </CheckboxDataContext.Provider>
    </CheckboxActionsContext.Provider>
  );
}
Checkbox.displayName = 'Checkbox';
