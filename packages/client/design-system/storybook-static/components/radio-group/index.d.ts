import { default as React } from '../../../../../../node_modules/react';
interface RadioGroupProps extends Omit<React.HTMLProps<HTMLDivElement>, 'onChange' | 'defaultValue' | 'checked' | 'defaultChecked' | 'value'> {
    defaultCheckedValue?: string;
    value?: string;
    onChange?: (value: string) => void;
    name?: string;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
    ref?: React.Ref<HTMLDivElement>;
}
export declare function RadioGroup({ defaultCheckedValue, value: controlledValue, onChange: controlledOnChange, disabled, className, children, name, ref, ...props }: RadioGroupProps): import("react/jsx-runtime").JSX.Element;
export declare namespace RadioGroup {
    var displayName: string;
}
export {};
