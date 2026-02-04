import { useContextAction } from '@hooks';
import React from 'react';

import { SelectActionsContext } from './index';

import type { HTMLAttributes, Ref } from 'react';

interface SelectOptionProps extends HTMLAttributes<HTMLLIElement> {
  item: string;
}
export const SelectOption = (
  { item, className, children, ...props }: SelectOptionProps,
  ref: Ref<HTMLLIElement>,
) => {
  const actions = useContextAction('Select.Option', SelectActionsContext);

  return (
    <li
      ref={ref}
      className={className}
      onClick={() => {
        actions.handleSelectValue(item);
      }}
      {...props}
    >
      {children}
    </li>
  );
};
