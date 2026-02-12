import { default as React, InputHTMLAttributes } from '../../../../../../node_modules/react';
export interface SelectSearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    placeholder: string;
    onChange?: (value: string, e?: React.ChangeEvent<HTMLInputElement>) => void;
    ref?: React.Ref<HTMLInputElement>;
}
export declare const SelectSearchInput: ({ value, onChange, placeholder, className, ref, ...props }: SelectSearchInputProps) => false | import("react/jsx-runtime").JSX.Element;
