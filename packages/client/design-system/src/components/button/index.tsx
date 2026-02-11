'use client';

import { cn } from '@lib/utils';
import { type ButtonHTMLAttributes } from 'react';

type ButtonColor = 'primary' | 'neutral';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xlg' | 'xxlg';
type ButtonVariant = 'filled' | 'outline';

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1',
  md: 'h-10 px-4 text-sm gap-1.5',
  lg: 'h-12 px-5 text-base gap-2',
  xlg: 'h-[52px] px-6 text-base gap-2',
  xxlg: 'h-14 px-6 text-lg gap-2 rounded-none',
};

const filledColorClasses: Record<ButtonColor, string> = {
  primary:
    'bg-primary-50 text-white hover:bg-primary-60 active:bg-primary-70 disabled:bg-gray-30 disabled:text-gray-50 disabled:cursor-not-allowed',
  neutral:
    'bg-gray-80 text-white hover:bg-gray-70 active:bg-gray-90 disabled:bg-gray-30 disabled:text-gray-50 disabled:cursor-not-allowed',
};

const outlineColorClasses: Record<ButtonColor, string> = {
  primary:
    'border border-primary-50 bg-white text-primary-50 hover:bg-primary-10 active:bg-primary-20 disabled:border-gray-30 disabled:text-gray-40 disabled:cursor-not-allowed',
  neutral:
    'border border-gray-40 bg-white text-gray-80 hover:bg-gray-10 active:bg-gray-20 disabled:border-gray-30 disabled:text-gray-40 disabled:cursor-not-allowed',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  width?: React.CSSProperties['width'];
  size?: ButtonSize;
  color?: ButtonColor;
}

export function Button({
  variant = 'filled',
  width,
  size = 'md',
  color = 'primary',
  children,
  className,
  style,
  ...props
}: ButtonProps) {
  const widthStyle =
    typeof width === 'number' ? { width: `${width}px` } : { width };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:ring-offset-2',
        sizeClasses[size],
        variant === 'filled'
          ? filledColorClasses[color]
          : outlineColorClasses[color],
        className,
      )}
      style={{ ...widthStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
