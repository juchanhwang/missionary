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
    <div className={cn('flex', className)}>
      {list.map((category) => (
        <div
          key={category.value}
          className={cn(
            'p-2.5 text-base font-bold leading-[22px] text-center cursor-pointer',
            category.value === selectedValue
              ? 'border-b border-primary-80 text-primary-80'
              : 'text-primary-30',
          )}
          onClick={() => onChange(category.value)}
        >
          {category.label}
        </div>
      ))}
    </div>
  );
};
