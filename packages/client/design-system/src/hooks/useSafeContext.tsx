'use client';

import { useContext } from 'react';

import type { Context } from 'react';

function captureSafeContextTrace(err: Error) {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, captureSafeContextTrace);
  }
}

export const useSafeContext = <T,>(
  context: Context<T>,
  hookName?: string,
): NonNullable<T> => {
  const value = useContext(context);
  if (value === undefined || value === null) {
    const providerName = context.displayName
      ? `<${context.displayName.replace(/Context$/, 'Provider')}>`
      : 'Provider';
    const caller = hookName ?? 'useSafeContext';
    const err = new Error(
      `${caller}는 ${providerName} 내부에서 사용해야 합니다.`,
    );
    captureSafeContextTrace(err);
    throw err;
  }

  return value;
};
