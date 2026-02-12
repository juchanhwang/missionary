import { Context } from '../../../../../node_modules/react';
export declare const useContextAction: <T>(component: string, actionContext: Context<T | null>) => T & ({} | undefined);
export type ContextAction<T> = ReturnType<typeof useContextAction<T>>;
