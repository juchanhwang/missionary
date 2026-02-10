'use client';

import { useControllableState, useMergeRefs } from '@hooks';
import React, { useContext, createContext, useMemo, useRef } from 'react';

import { RadioGroupActionsContext } from '../radio-group/radioGroupContext';

export const RadioActionsContext = createContext<{
  onChange: (checked: boolean) => void;
} | null>(null);
RadioActionsContext.displayName = 'RadioActionsContext';

export const RadioDataContext = createContext<{
  checked: boolean;
} | null>(null);
RadioDataContext.displayName = 'RadioDataContext';

interface RadioProps extends Omit<
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

export function Radio({
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
}: RadioProps) {
  const groupActions = useContext(RadioGroupActionsContext);
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
      groupActions.changeValue?.(value);
    }
  };

  const handleClick = () => {
    internalRef.current?.click();
  };

  return (
    <RadioActionsContext.Provider value={actions}>
      <RadioDataContext.Provider value={data}>
        <input
          type="radio"
          role="radio"
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
      </RadioDataContext.Provider>
    </RadioActionsContext.Provider>
  );
}
Radio.displayName = 'Radio';
