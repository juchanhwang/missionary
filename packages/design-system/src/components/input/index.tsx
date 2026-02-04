'use client';

import { IconInputError, IconInputReset } from '@assets/icons'; // icons 디렉토리의 index 파일에서 export한 컴포넌트를 불러옵니다.
import React from 'react';

import { InputLayout, InputBox, InputError } from './InputLayout';

import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputType: string;
  disabled?: boolean;
  value: string;
  error?: string;
  onClick?: () => void;
  onReset?: () => void;
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({
  inputType = 'text',
  disabled,
  value,
  error,
  onChange,
  onClick,
  onReset,
  ref,
  ...rest
}: InputProps) {
  return (
    <InputLayout>
      <InputBox>
        <input
          type={inputType}
          disabled={disabled}
          autoComplete="off"
          value={value}
          onChange={onChange}
          onClick={onClick}
          ref={ref}
          {...rest}
        />
        {error && <IconInputError />}
        <IconInputReset onClick={() => onReset?.()} />
      </InputBox>
      {error && <InputError>{error}</InputError>}
    </InputLayout>
  );
}
Input.displayName = 'Input';
