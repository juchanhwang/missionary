export declare const useEvent: <F extends (...args: any[]) => any, P extends any[] = Parameters<F>, R = ReturnType<F>>(fn: (...args: P) => R) => (...args: P) => R;
