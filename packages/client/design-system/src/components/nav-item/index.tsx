'use client';

import { cn } from '@lib/utils';
import { ChevronDown } from 'lucide-react';
import React from 'react';

export interface NavItemProps {
  label: string;
  href?: string;
  onClick?: (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => void;
  isActive?: boolean;
  isExpanded?: boolean;
  hasChildren?: boolean;
  depth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function NavItem({
  label,
  href,
  onClick,
  isActive,
  isExpanded,
  hasChildren,
  depth = 0,
  className,
  style,
}: NavItemProps) {
  const isParent = depth === 0;

  const baseClasses =
    'flex items-center justify-between w-full transition-colors duration-200 cursor-pointer text-left font-medium text-[15px] leading-[22px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

  const parentClasses = cn(
    'h-11 px-5 text-white/80 hover:text-white hover:bg-white/8 rounded-md mx-2',
    {
      'bg-white/10 text-white': isActive,
    },
  );

  const childClasses = cn(
    'h-10 px-5 pl-9 text-white/60 hover:text-white/90 hover:bg-white/5 rounded-md mx-2',
    {
      'bg-white/8 text-white/90': isActive,
    },
  );

  const classes = cn(
    baseClasses,
    isParent ? parentClasses : childClasses,
    className,
  );

  const content = (
    <>
      <span className="flex-1 truncate">{label}</span>
      {hasChildren && (
        <ChevronDown
          size={20}
          strokeWidth={1.5}
          className={cn('transition-transform duration-200', {
            'rotate-180': isExpanded,
          })}
        />
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} style={style} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes} style={style}>
      {content}
    </button>
  );
}
