import { useContextAction, useContextData } from '@hooks';
import { cn } from '@lib/utils';
import React, { useCallback } from 'react';

import { SelectActionsContext, SelectDataContext } from './index';

import type { ButtonHTMLAttributes } from 'react';

export interface TriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
}
export const SelectTrigger = ({
  children,
  className,
  ref,
  ...props
}: TriggerProps) => {
  const actions = useContextAction('Select.Trigger', SelectActionsContext);
  const data = useContextData('Select.Trigger', SelectDataContext);

  const handleOnClick = useCallback(() => {
    actions.setOpen((prevOpen) => !prevOpen);
  }, [actions.setOpen]);

  const isEmpty =
    data.selectedValue === undefined ||
    data.selectedValue === null ||
    (Array.isArray(data.selectedValue) && data.selectedValue.length === 0);

  return (
    <button
      ref={ref}
      onClick={handleOnClick}
      type="button"
      data-state={data.open ? 'open' : 'closed'}
      className={cn(
        'flex h-12 w-full items-center justify-between rounded-lg border border-gray-20 bg-white px-4 py-2 text-sm transition-colors hover:border-gray-40 focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=open]:border-primary-50',
        isEmpty ? 'text-gray-30' : 'text-gray-90',
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'ml-2 h-5 w-5 shrink-0 transition-transform duration-200',
          {
            'rotate-180': data.open,
          },
        )}
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};
