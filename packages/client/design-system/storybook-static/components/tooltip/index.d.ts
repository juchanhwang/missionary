import { default as React } from '../../../../../../node_modules/react';
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: TooltipPosition;
    className?: string;
}
export declare const Tooltip: ({ text, children, position, className, }: TooltipProps) => import("react/jsx-runtime").JSX.Element;
export {};
