'use client';

import { cn } from '@lib/utils';
import { Search } from 'lucide-react';
import React from 'react';

import { formSizeClasses } from '../form-size';

import type { FormSize } from '../form-size';

interface SearchBoxProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  size?: FormSize;
  ref?: React.Ref<HTMLInputElement>;
}

export function SearchBox({
  value,
  placeholder = '검색',
  onChange,
  className,
  size = 'md',
  ref,
}: SearchBoxProps) {
  const sizeClass = formSizeClasses[size];

  return (
    <div
      className={cn(
        'flex w-full items-center rounded-lg border border-gray-30 bg-gray-10 transition-colors',
        sizeClass.container,
        'focus-within:ring-1 focus-within:ring-gray-50 focus-within:border-gray-50',
        'hover:border-gray-40',
        className,
      )}
    >
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        ref={ref}
        className={cn(
          'flex-1 border-0 bg-transparent text-black leading-[1.429] focus:outline-none placeholder:text-gray-50',
          sizeClass.text,
        )}
      />
      <Search size={sizeClass.icon} className="shrink-0 ml-2 text-gray-50" />
    </div>
  );
}
SearchBox.displayName = 'SearchBox';
