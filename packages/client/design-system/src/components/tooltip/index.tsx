'use client';

import { cn } from '@lib/utils';
import React from 'react';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: TooltipPosition;
  className?: string;
}

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2',
  bottom: 'top-[calc(100%+8px)] left-1/2 -translate-x-1/2',
  left: 'right-[calc(100%+8px)] top-1/2 -translate-y-1/2',
  right: 'left-[calc(100%+8px)] top-1/2 -translate-y-1/2',
};

const arrowClasses: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-90 border-x-transparent border-b-transparent border-4',
  bottom:
    'bottom-full left-1/2 -translate-x-1/2 border-b-gray-90 border-x-transparent border-t-transparent border-4',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-90 border-y-transparent border-r-transparent border-4',
  right:
    'right-full top-1/2 -translate-y-1/2 border-r-gray-90 border-y-transparent border-l-transparent border-4',
};

export const Tooltip = ({
  text,
  children,
  position = 'top',
  className,
}: TooltipProps) => {
  return (
    <div
      className={cn('relative inline-block cursor-pointer group', className)}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          'absolute z-10 w-max px-3 py-1.5 rounded text-xs text-white text-center opacity-0 invisible transition-opacity duration-300 group-hover:opacity-100 group-hover:visible bg-gray-90',
          positionClasses[position],
        )}
      >
        {text}
        <span
          className={cn('absolute w-0 h-0', arrowClasses[position])}
          aria-hidden
        />
      </span>
    </div>
  );
};
