import { VariantProps } from 'class-variance-authority';
import { ReactNode } from '../../../../../../node_modules/react';
declare const badgeVariants: (props?: ({
    variant?: "default" | "outline" | "success" | "warning" | "info" | "destructive" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export interface BadgeProps extends VariantProps<typeof badgeVariants> {
    children: ReactNode;
    className?: string;
}
export declare function Badge({ variant, children, className }: BadgeProps): import("react/jsx-runtime").JSX.Element;
export declare namespace Badge {
    var displayName: string;
}
export {};
