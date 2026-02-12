import { default as React } from '../../../../../../node_modules/react';
export interface NavItemProps {
    label: string;
    href?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
    isActive?: boolean;
    isExpanded?: boolean;
    hasChildren?: boolean;
    depth?: number;
    className?: string;
    style?: React.CSSProperties;
}
export declare function NavItem({ label, href, onClick, isActive, isExpanded, hasChildren, depth, className, style, }: NavItemProps): import("react/jsx-runtime").JSX.Element;
