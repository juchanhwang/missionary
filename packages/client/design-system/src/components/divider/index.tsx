'use client';

import { cn } from '@lib/utils';

interface DividerProps {
  height?: 4 | 10 | 12 | 24;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const heightClasses: Record<number, string> = {
  4: 'h-1',
  10: 'h-2.5',
  12: 'h-3',
  24: 'h-6',
};

export function Divider({
  height = 4,
  orientation = 'horizontal',
  className,
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn('w-px self-stretch bg-gray-05', className)}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  return (
    <div
      className={cn('w-full bg-gray-05', heightClasses[height], className)}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}
Divider.displayName = 'Divider';
