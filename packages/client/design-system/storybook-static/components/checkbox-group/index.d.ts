import { default as React } from '../../../../../../node_modules/react';
import { Checkbox } from '../checkbox';
interface CheckboxGroupProps extends Omit<React.HTMLProps<HTMLDivElement>, 'onChange' | 'defaultValue' | 'checked' | 'defaultChecked'> {
    defaultCheckedValues?: string[];
    checkedValues?: string[];
    onChange?: (value: string[]) => void;
    name?: string;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
    ref?: React.Ref<HTMLDivElement>;
}
declare function CheckboxGroupRoot({ defaultCheckedValues, checkedValues: controlledCheckedValueList, onChange: controlledOnChange, disabled, className, children, name, ref, ...props }: CheckboxGroupProps): import("react/jsx-runtime").JSX.Element;
export declare const CheckboxGroup: typeof CheckboxGroupRoot & {
    Item: typeof Checkbox;
};
export {};
