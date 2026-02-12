export declare const useControllableState: <T>(controlledValue: T | undefined, onChange?: (value: T) => void, defaultValue?: T) => readonly [NonNullable<T>, (value: T) => void | undefined];
