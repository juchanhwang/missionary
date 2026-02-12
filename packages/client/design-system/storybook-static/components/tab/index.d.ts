interface TabProps {
    list: Array<{
        value: string;
        label: string;
    }>;
    selectedValue: string;
    onChange: (value: string) => void;
    className?: string;
}
export declare const Tab: ({ list, selectedValue, onChange, className }: TabProps) => import("react/jsx-runtime").JSX.Element;
export {};
