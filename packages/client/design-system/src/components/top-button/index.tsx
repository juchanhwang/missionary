'use client';

import { cn } from '@lib/utils';
import { ArrowUp } from 'lucide-react';

interface TopButtonProps {
  onClick?: () => void;
  className?: string;
}

export function TopButton({ onClick, className }: TopButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center w-12 h-12 p-0 border border-gray-20 rounded-full bg-white shadow-md opacity-70 cursor-pointer transition-all hover:opacity-100 hover:shadow-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        className,
      )}
      aria-label="맨 위로 이동"
    >
      <ArrowUp size={24} />
    </button>
  );
}
TopButton.displayName = 'TopButton';
