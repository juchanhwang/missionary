'use client';

import { cn } from '@lib/utils';
import React from 'react';

interface SearchBoxProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export function SearchBox({
  value,
  placeholder = '검색',
  onChange,
  className,
  ref,
}: SearchBoxProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center px-4 py-2.5 rounded-lg bg-gray-10 transition-colors',
        'focus-within:ring-1 focus-within:ring-gray-40 focus-within:border-gray-40',
        'hover:bg-gray-20',
        className,
      )}
    >
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        ref={ref}
        className="flex-1 border-0 bg-transparent text-black text-sm leading-[1.429] focus:outline-none placeholder:text-gray-30"
      />
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 ml-2 text-gray-30"
      >
        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
        <path
          d="M13.5 13.5L17 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
SearchBox.displayName = 'SearchBox';
