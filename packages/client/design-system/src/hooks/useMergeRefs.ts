'use client';

import { useCallback } from 'react';

export function useMergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return useCallback((node: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && typeof ref === 'object') {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  }, refs);
}
