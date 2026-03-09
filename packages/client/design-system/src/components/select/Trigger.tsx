import { useContextAction, useContextData } from '@hooks';
import { cn } from '@lib/utils';
import { ChevronDown } from 'lucide-react';
import React, { useCallback } from 'react';

import { formSizeClasses } from '../form-size';

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
  const sizeClass = formSizeClasses[data.size];

  const handleOnClick = useCallback(() => {
    actions.setOpen((prevOpen) => !prevOpen);
  }, [actions]);

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
        'flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 transition-colors hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50',
        sizeClass.container,
        sizeClass.text,
        'data-[state=open]:border-gray-400 data-[state=open]:ring-1 data-[state=open]:ring-gray-400',
        isEmpty ? 'text-gray-400' : 'text-gray-900',
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      <ChevronDown
        size={sizeClass.icon}
        strokeWidth={1.5}
        className={cn('ml-2 shrink-0 transition-transform duration-200', {
          'rotate-180': data.open,
        })}
      />
    </button>
  );
};
