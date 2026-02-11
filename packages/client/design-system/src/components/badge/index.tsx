'use client';

import { cn } from '@lib/utils';

import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'info';

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-10 text-green-50',
  warning: 'bg-warning-10 text-warning-70',
  info: 'bg-primary-10 text-primary-80',
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded text-sm font-bold leading-[1.429] whitespace-nowrap',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
Badge.displayName = 'Badge';
