'use client';

import { colors } from '@styles/color';

import { BadgeRoot } from './BadgeLayout';

import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'info';

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<
  BadgeVariant,
  { backgroundColor: string; textColor: string }
> = {
  success: { backgroundColor: colors.green90, textColor: colors.green50 },
  warning: { backgroundColor: colors.error90, textColor: colors.error30 },
  info: { backgroundColor: colors.primary90, textColor: colors.primary20 },
};

export function Badge({ variant, children, className }: BadgeProps) {
  const { backgroundColor, textColor } = variantStyles[variant];

  return (
    <BadgeRoot
      backgroundColor={backgroundColor}
      textColor={textColor}
      className={className}
    >
      {children}
    </BadgeRoot>
  );
}
Badge.displayName = 'Badge';
