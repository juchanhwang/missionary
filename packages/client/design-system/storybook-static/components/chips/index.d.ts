import { VariantProps } from 'class-variance-authority';
import { ReactNode } from '../../../../../../node_modules/react';
declare const chipsVariants: (props?: ({
    variant?: "default" | "outline" | "accent" | null | undefined;
    size?: "sm" | "md" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export interface ChipsProps extends VariantProps<typeof chipsVariants> {
    children: ReactNode;
    onDismiss?: () => void;
    className?: string;
}
export declare function Chips({ children, variant, size, onDismiss, className, }: ChipsProps): import("react/jsx-runtime").JSX.Element;
export declare namespace Chips {
    var displayName: string;
}
export {};
