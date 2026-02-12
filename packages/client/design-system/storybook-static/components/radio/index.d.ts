import { default as React } from '../../../../../../node_modules/react';
export declare const RadioActionsContext: React.Context<{
    onChange: (checked: boolean) => void;
} | null>;
export declare const RadioDataContext: React.Context<{
    checked: boolean;
} | null>;
interface RadioProps extends Omit<React.HTMLProps<HTMLInputElement>, 'onChange'> {
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
export declare function Radio({ defaultChecked, checked: controlledChecked, onChange: controlledOnChange, value, disabled, className, children, label, name, ref, ...props }: RadioProps): import("react/jsx-runtime").JSX.Element;
export declare namespace Radio {
    var displayName: string;
}
export {};
