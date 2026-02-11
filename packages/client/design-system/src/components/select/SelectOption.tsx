import { useContextAction, useContextData } from '@hooks';
import { cn } from '@lib/utils';
import React from 'react';

import { SelectActionsContext, SelectDataContext } from './index';

import type { HTMLAttributes } from 'react';

export interface SelectOptionProps extends HTMLAttributes<HTMLLIElement> {
  item: string;
  ref?: React.Ref<HTMLLIElement>;
}
export const SelectOption = ({
  item,
  className,
  children,
  ref,
  ...props
}: SelectOptionProps) => {
  const actions = useContextAction('Select.Option', SelectActionsContext);
  const data = useContextData('Select.Option', SelectDataContext);

  const isSelected = Array.isArray(data.selectedValue)
    ? data.selectedValue.includes(item)
    : data.selectedValue === item;

  return (
    <li
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center px-4 py-2.5 text-sm transition-colors hover:bg-gray-10 active:bg-gray-20',
        'data-[selected=true]:bg-gray-10 data-[selected=true]:text-gray-90 data-[selected=true]:font-medium',
        className,
      )}
      data-selected={isSelected}
      onClick={() => {
        actions.handleSelectValue(item);
      }}
      {...props}
    >
      {children}
    </li>
  );
};
