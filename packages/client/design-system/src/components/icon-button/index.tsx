'use client';

import { cn } from '@lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ButtonHTMLAttributes } from 'react';

const iconButtonVariants = cva(
  'rounded-lg flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        ghost: 'bg-transparent hover:bg-gray-02',
        filled: 'bg-primary-80 text-white hover:bg-primary-60',
        outline: 'border border-gray-20 bg-transparent hover:bg-gray-02',
      },
      size: {
        sm: 'h-8',
        md: 'h-10',
        lg: 'h-12',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  },
);

const squareClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-8',
  md: 'w-10',
  lg: 'w-12',
};

export interface IconButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode;
  label?: string;
}

export function IconButton({
  icon,
  label,
  size = 'md',
  variant = 'ghost',
  className,
  ...props
}: IconButtonProps) {
  const hasLabel = !!label;

  return (
    <button
      className={cn(
        iconButtonVariants({ variant, size }),
        hasLabel ? 'w-auto px-3 gap-1' : squareClasses[size!],
        className,
      )}
      {...props}
    >
      {icon}
      {hasLabel && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}
