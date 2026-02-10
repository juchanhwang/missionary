'use client';

import { useControllableState, useMergeRefs } from '@hooks';
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
          {children}
        </div>
      </CheckboxDataContext.Provider>
    </CheckboxActionsContext.Provider>
  );
}
Checkbox.displayName = 'Checkbox';
