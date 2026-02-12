import { default as React, InputHTMLAttributes } from '../../../../../../node_modules/react';
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    onReset?: () => void;
    ref?: React.Ref<HTMLInputElement>;
}
export declare function Input({ type, disabled, value, error, className, onReset, ref, ...rest }: InputProps): import("react/jsx-runtime").JSX.Element;
export declare namespace Input {
    var displayName: string;
}
export {};
