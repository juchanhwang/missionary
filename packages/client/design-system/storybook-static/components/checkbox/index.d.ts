import { default as React } from '../../../../../../node_modules/react';
export declare const CheckboxActionsContext: React.Context<{
    onChange: (checked: boolean) => void;
} | null>;
export declare const CheckboxDataContext: React.Context<{
    checked: boolean;
} | null>;
interface CheckboxProps extends Omit<React.HTMLProps<HTMLInputElement>, 'onChange'> {
    defaultChecked?: boolean;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
    name?: string;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
    label?: string;
    ref?: React.Ref<HTMLInputElement>;
}
export declare function Checkbox({ defaultChecked, checked: controlledChecked, onChange: controlledOnChange, value, disabled, className, children, label, name, ref, ...props }: CheckboxProps): import("react/jsx-runtime").JSX.Element;
export declare namespace Checkbox {
    var displayName: string;
}
export {};
