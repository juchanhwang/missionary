'use client';

import { ChipsRoot } from './ChipsLayout';

import type { ReactNode } from 'react';

interface ChipsProps {
  children: ReactNode;
  className?: string;
}

export function Chips({ children, className }: ChipsProps) {
  return <ChipsRoot className={className}>{children}</ChipsRoot>;
}
Chips.displayName = 'Chips';
