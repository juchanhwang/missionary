import { useContextAction, useContextData } from '@hooks';
import { cn } from '@lib/utils';
import { ChevronDown } from 'lucide-react';
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
        'flex h-12 w-full items-center justify-between rounded-lg border border-gray-30 bg-gray-10 px-4 py-2 text-sm transition-colors hover:border-gray-40 focus:outline-none focus:ring-1 focus:ring-gray-50 disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=open]:border-gray-50 data-[state=open]:ring-1 data-[state=open]:ring-gray-50',
        isEmpty ? 'text-gray-50' : 'text-gray-90',
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      <ChevronDown
        size={20}
        strokeWidth={1.5}
        className={cn(
          'ml-2 h-5 w-5 shrink-0 transition-transform duration-200',
          {
            'rotate-180': data.open,
          },
        )}
      />
    </button>
  );
};
