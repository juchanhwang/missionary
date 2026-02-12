import { default as React, InputHTMLAttributes } from '../../../../../../node_modules/react';
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    hideLabel?: boolean;
    error?: string;
    onClear?: () => void;
    ref?: React.Ref<HTMLInputElement>;
}
export declare function InputField({ label, hideLabel, error, onClear, value, disabled, className, id: providedId, ref, ...rest }: InputFieldProps): import("react/jsx-runtime").JSX.Element;
export declare namespace InputField {
    var displayName: string;
}
export {};
