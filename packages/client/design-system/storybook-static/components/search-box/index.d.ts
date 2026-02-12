import { default as React } from '../../../../../../node_modules/react';
interface SearchBoxProps {
    value?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    className?: string;
    ref?: React.Ref<HTMLInputElement>;
}
export declare function SearchBox({ value, placeholder, onChange, className, ref, }: SearchBoxProps): import("react/jsx-runtime").JSX.Element;
export declare namespace SearchBox {
    var displayName: string;
}
export {};
