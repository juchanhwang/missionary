'use client';

import React from 'react';

import {
  InputFieldRoot,
  InputFieldLabel,
  InputFieldBox,
  InputFieldCounter,
  InputFieldError,
} from './InputFieldLayout';

import type { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export function InputField({
  label,
  error,
  maxLength,
  value,
  disabled,
  className,
  ref,
  ...rest
}: InputFieldProps) {
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <InputFieldRoot className={className}>
      {label && <InputFieldLabel>{label}</InputFieldLabel>}
      <InputFieldBox disabled={disabled}>
        <input
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          ref={ref}
          {...rest}
        />
        {maxLength != null && (
          <InputFieldCounter>
            {currentLength}/{maxLength}
          </InputFieldCounter>
        )}
      </InputFieldBox>
      {error && <InputFieldError>{error}</InputFieldError>}
    </InputFieldRoot>
  );
}
InputField.displayName = 'InputField';
