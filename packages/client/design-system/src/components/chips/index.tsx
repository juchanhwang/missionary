'use client';

import { cn } from '@lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

import type { ReactNode } from 'react';

const chipsVariants = cva(
  'inline-flex items-center gap-1 rounded-2xl transition-colors whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-gray-05 text-black',
        secondary: 'bg-primary-10 text-primary-80',
        outline: 'border border-gray-20 bg-transparent text-gray-80',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface ChipsProps extends VariantProps<typeof chipsVariants> {
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export function Chips({
  children,
  variant,
  size,
  onDismiss,
  className,
}: ChipsProps) {
  return (
    <span className={cn(chipsVariants({ variant, size }), className)}>
      {children}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-1 rounded-full hover:bg-gray-10 p-0.5"
          aria-label="Remove"
        >
          <svg
            className="h-3 w-3"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M9.5 3.5L3.5 9.5M3.5 3.5L9.5 9.5" />
          </svg>
        </button>
      )}
    </span>
  );
}
Chips.displayName = 'Chips';
