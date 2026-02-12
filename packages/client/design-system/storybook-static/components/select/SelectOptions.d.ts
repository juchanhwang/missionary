import { default as React, HTMLProps } from '../../../../../../node_modules/react';
export interface SelectOptionsProps extends HTMLProps<HTMLUListElement> {
    label?: string;
    ref?: React.Ref<HTMLUListElement>;
}
export declare const SelectOptions: ({ children, label, className, ref, ...props }: SelectOptionsProps) => import("react/jsx-runtime").JSX.Element | null;
