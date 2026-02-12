import { default as React, HTMLAttributes } from '../../../../../../node_modules/react';
export interface SelectOptionProps extends HTMLAttributes<HTMLLIElement> {
    item: string;
    ref?: React.Ref<HTMLLIElement>;
}
export declare const SelectOption: ({ item, className, children, ref, ...props }: SelectOptionProps) => import("react/jsx-runtime").JSX.Element;
