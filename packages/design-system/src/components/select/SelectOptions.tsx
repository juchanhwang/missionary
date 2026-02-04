import { useContextData } from '@hooks';
import React from 'react';

import { SelectDataContext } from './index';

import type { HTMLProps, Ref } from 'react';

interface SelectOptionsProps extends HTMLProps<HTMLUListElement> {
  label?: string;
}
export const SelectOptions = (
  { children, label, className, ...props }: SelectOptionsProps,
  ref: Ref<HTMLUListElement>,
) => {
  const data = useContextData('Select.Options', SelectDataContext);

  return (
    data.open && (
      <ul ref={ref} className={className} {...props}>
        {label && <div>{label}</div>}
        {children}
      </ul>
    )
  );
};
