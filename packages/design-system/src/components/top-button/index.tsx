'use client';

import { TopButtonRoot } from './TopButtonLayout';

interface TopButtonProps {
  onClick?: () => void;
  className?: string;
}

export function TopButton({ onClick, className }: TopButtonProps) {
  return (
    <TopButtonRoot
      type="button"
      onClick={onClick}
      className={className}
      aria-label="맨 위로 이동"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 5L5 12M12 5L19 12M12 5V19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </TopButtonRoot>
  );
}
TopButton.displayName = 'TopButton';
