'use client';

import { cn } from '@lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import type { ReactNode } from 'react';

const chipsVariants = cva(
  'inline-flex items-center gap-1 rounded-2xl transition-colors whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-gray-50 text-gray-800',
        accent: 'bg-gray-800 text-white',
        outline: 'border border-gray-200 bg-transparent text-gray-800',
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
          className="ml-1 rounded-full hover:bg-gray-50 p-0.5"
          aria-label="Remove"
        >
          <X size={12} strokeWidth={1.5} className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
Chips.displayName = 'Chips';
