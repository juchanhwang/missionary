'use client';

import { useControllableState, useMergeRefs } from '@hooks';
import { cn } from '@lib/utils';
import React, { createContext, useMemo, useRef } from 'react';

export const SwitchActionsContext = createContext<{
  onChange: (checked: boolean) => void;
} | null>(null);
SwitchActionsContext.displayName = 'SwitchActionsContext';

export const SwitchDataContext = createContext<{
  checked: boolean;
} | null>(null);
SwitchDataContext.displayName = 'SwitchDataContext';

interface SwitchProps extends Omit<
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
  focus?: boolean;
}

export function Switch({
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
}: SwitchProps) {
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
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-primary-80' : 'bg-gray-20',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </span>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );

  return (
    <SwitchActionsContext.Provider value={actions}>
      <SwitchDataContext.Provider value={data}>
        <input
          type="checkbox"
          role="switch"
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
      </SwitchDataContext.Provider>
    </SwitchActionsContext.Provider>
  );
}
Switch.displayName = 'Switch';
