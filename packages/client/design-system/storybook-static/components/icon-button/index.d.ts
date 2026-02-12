import { VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes } from '../../../../../../node_modules/react';
declare const iconButtonVariants: (props?: ({
    variant?: "filled" | "outline" | "ghost" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonVariants> {
    icon: React.ReactNode;
    label?: string;
}
export declare function IconButton({ icon, label, size, variant, className, ...props }: IconButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
