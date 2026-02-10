'use client';

import { useControllableState, useMergeRefs } from '@hooks';
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
          {children}
        </div>
      </SwitchDataContext.Provider>
    </SwitchActionsContext.Provider>
  );
}
Switch.displayName = 'Switch';
