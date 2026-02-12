import { default as React } from '../../../../../../node_modules/react';
export interface DatePickerProps {
    label?: string;
    hideLabel?: boolean;
    error?: string;
    selected?: Date | null;
    value?: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
    name?: string;
    onBlur?: () => void;
    ref?: React.Ref<HTMLInputElement>;
    startDate?: Date | null;
    endDate?: Date | null;
    selectsStart?: boolean;
    selectsEnd?: boolean;
    minDate?: Date | undefined;
    maxDate?: Date | undefined;
    dateFormat?: string;
    showTimeSelect?: boolean;
    timeFormat?: string;
    timeIntervals?: number;
    timeCaption?: string;
    isClearable?: boolean;
}
export declare function DatePicker({ label, hideLabel, error, selected, value, onChange, placeholder, disabled, className, id: providedId, name, onBlur, ref, ...rest }: DatePickerProps): import("react/jsx-runtime").JSX.Element;
export declare namespace DatePicker {
    var displayName: string;
}
