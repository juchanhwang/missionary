import { default as React, ReactNode, CSSProperties } from '../../../../../../node_modules/react';
interface StyledProps {
    textAlign?: CSSProperties['textAlign'];
    fontWeight?: CSSProperties['fontWeight'];
    color?: string;
}
interface AsProp<T extends React.ElementType> {
    as?: T;
}
type PolymorphicRef<T extends React.ElementType> = React.ComponentPropsWithRef<T>['ref'];
type PolymorphicComponentProps<T extends React.ElementType, Props> = AsProp<T> & React.ComponentPropsWithoutRef<T> & Props & {
    ref?: PolymorphicRef<T>;
};
type TypographyValue = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'b1' | 'b2' | 'b3';
type TextProps<T extends React.ElementType> = PolymorphicComponentProps<T, {
    children?: ReactNode;
    className?: string;
    typo?: TypographyValue;
} & StyledProps>;
type TextComponent = <T extends React.ElementType = 'span'>(props: TextProps<T>) => React.ReactNode | null;
export declare const Text: TextComponent;
export {};
