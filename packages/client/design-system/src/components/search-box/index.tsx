'use client';

import { cn } from '@lib/utils';
import { Search } from 'lucide-react';
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
        'flex w-full items-center px-4 py-2.5 rounded-lg border border-gray-30 bg-gray-10 transition-colors',
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
        className="flex-1 border-0 bg-transparent text-black text-sm leading-[1.429] focus:outline-none placeholder:text-gray-50"
      />
      <Search size={20} className="shrink-0 ml-2 text-gray-50" />
    </div>
  );
}
SearchBox.displayName = 'SearchBox';
