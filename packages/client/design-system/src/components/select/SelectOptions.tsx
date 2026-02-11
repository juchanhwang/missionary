import { useContextData } from '@hooks';
import { cn } from '@lib/utils';
import React from 'react';

import { SelectDataContext } from './index';

import type { HTMLProps } from 'react';

export interface SelectOptionsProps extends HTMLProps<HTMLUListElement> {
  label?: string;
  ref?: React.Ref<HTMLUListElement>;
}
export const SelectOptions = ({
  children,
  label,
  className,
  ref,
  ...props
}: SelectOptionsProps) => {
  const data = useContextData('Select.Options', SelectDataContext);

  if (!data.open) return null;

  return (
    <ul
      ref={ref}
      className={cn(
        'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-10 bg-white py-1 shadow-lg',
        className,
      )}
      {...props}
    >
      {label && (
        <div className="px-2 py-1.5 text-xs font-semibold text-gray-50">
          {label}
        </div>
      )}
      {children}
    </ul>
  );
};
