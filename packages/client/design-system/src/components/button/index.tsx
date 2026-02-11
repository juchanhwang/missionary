'use client';

import { cn } from '@lib/utils';
import { type ButtonHTMLAttributes } from 'react';

type ButtonColor = 'primary' | 'neutral';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xlg' | 'xxlg';
type ButtonVariant = 'filled' | 'outline';

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xlg: 'h-[52px]',
  xxlg: 'h-14 rounded-none',
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
        'text-base font-bold rounded-lg transition-colors',
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
