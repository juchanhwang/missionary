'use client';

import { cn } from '@lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

import type { ReactNode } from 'react';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-ring whitespace-nowrap',
  {
    variants: {
      variant: {
        success: 'border-transparent bg-green-10 text-green-60',
        warning: 'border-transparent bg-warning-10 text-warning-50',
        info: 'border-transparent bg-blue-10 text-blue-60',
        default: 'border-transparent bg-gray-800 text-white hover:bg-gray-700',
        destructive:
          'border-transparent bg-primary-50 text-white hover:bg-primary-60',
        outline:
          'border-gray-200 bg-transparent text-gray-800 hover:bg-gray-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {children}
    </span>
  );
}
Badge.displayName = 'Badge';
