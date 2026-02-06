'use client';

import { DividerRoot } from './DividerLayout';

interface DividerProps {
  height?: 4 | 10 | 12 | 24;
  className?: string;
}

export function Divider({ height = 4, className }: DividerProps) {
  return <DividerRoot height={height} className={className} />;
}
Divider.displayName = 'Divider';
