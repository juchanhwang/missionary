'use client';

import React from 'react';

import { SearchBoxRoot } from './SearchBoxLayout';

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
    <SearchBoxRoot className={className}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        ref={ref}
      />
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
        <path
          d="M13.5 13.5L17 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </SearchBoxRoot>
  );
}
SearchBox.displayName = 'SearchBox';
