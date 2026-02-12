import { default as React, ButtonHTMLAttributes } from '../../../../../../node_modules/react';
export interface TriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    ref?: React.Ref<HTMLButtonElement>;
}
export declare const SelectTrigger: ({ children, className, ref, ...props }: TriggerProps) => import("react/jsx-runtime").JSX.Element;
