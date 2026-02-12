import { default as React } from '../../../../../../node_modules/react';
export declare const SwitchActionsContext: React.Context<{
    onChange: (checked: boolean) => void;
} | null>;
export declare const SwitchDataContext: React.Context<{
    checked: boolean;
} | null>;
interface SwitchProps extends Omit<React.HTMLProps<HTMLInputElement>, 'onChange'> {
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
    focus?: boolean;
}
export declare function Switch({ defaultChecked, checked: controlledChecked, onChange: controlledOnChange, value, disabled, className, children, label, name, ref, ...props }: SwitchProps): import("react/jsx-runtime").JSX.Element;
export declare namespace Switch {
    var displayName: string;
}
export {};
