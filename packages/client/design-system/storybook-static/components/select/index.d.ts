import { default as React } from '../../../../../../node_modules/react';
type ValueType = string | string[] | undefined | null;
export declare const SelectActionsContext: React.Context<{
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleSelectValue: (value: string) => void;
} | null>;
export declare const SelectDataContext: React.Context<{
    open: boolean;
    selectedValue?: ValueType;
} | null>;
interface SelectRootProps {
    defaultValue?: ValueType;
    value?: ValueType;
    multiple?: boolean;
    children?: React.ReactNode;
    className?: string;
    onChange?(value?: ValueType): void;
    onBlur?: () => void;
    name?: string;
    ref?: React.Ref<HTMLDivElement>;
}
export declare const Select: (({ defaultValue, value: controlledValue, onChange: controlledOnChange, children, multiple, onBlur, name, ref, }: SelectRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Trigger: ({ children, className, ref, ...props }: import('./Trigger').TriggerProps) => import("react/jsx-runtime").JSX.Element;
    SearchInput: ({ value, onChange, placeholder, className, ref, ...props }: import('./SelectSearchInput').SelectSearchInputProps) => false | import("react/jsx-runtime").JSX.Element;
    Options: ({ children, label, className, ref, ...props }: import('./SelectOptions').SelectOptionsProps) => import("react/jsx-runtime").JSX.Element | null;
    Option: ({ item, className, children, ref, ...props }: import('./SelectOption').SelectOptionProps) => import("react/jsx-runtime").JSX.Element;
};
export {};
