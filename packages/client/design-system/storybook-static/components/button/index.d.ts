import { ButtonHTMLAttributes } from '../../../../../../node_modules/react';
type ButtonColor = 'primary' | 'neutral';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xlg' | 'xxlg';
type ButtonVariant = 'filled' | 'outline';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    width?: React.CSSProperties['width'];
    size?: ButtonSize;
    color?: ButtonColor;
}
export declare function Button({ variant, width, size, color, children, className, style, ...props }: ButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
