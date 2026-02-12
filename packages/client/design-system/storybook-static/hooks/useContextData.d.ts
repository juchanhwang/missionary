import { Context } from '../../../../../node_modules/react';
export declare const useContextData: <T>(component: string, dataContext: Context<T | null>) => T & ({} | undefined);
export type ContextData<T> = ReturnType<typeof useContextData<T>>;
