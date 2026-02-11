'use client';

import { cn } from '@lib/utils';
import React from 'react';

interface TabProps {
  list: Array<{
    value: string;
    label: string;
  }>;
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export const Tab = ({ list, selectedValue, onChange, className }: TabProps) => {
  return (
    <div role="tablist" className={cn('flex', className)}>
      {list.map((category) => {
        const isActive = category.value === selectedValue;
        return (
          <button
            key={category.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(
              'px-4 py-2 text-base font-bold leading-[22px] text-center cursor-pointer transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              isActive
                ? 'border-primary-80 text-primary-80'
                : 'border-transparent text-primary-30 hover:text-primary-50',
            )}
            onClick={() => onChange(category.value)}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
};
