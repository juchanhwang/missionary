'use client';

import { useCallback } from 'react';

export function useMergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  /* eslint-disable react-hooks/use-memo, react-hooks/exhaustive-deps -- rest params는 정적 분석 불가, 런타임에서 개별 ref를 비교하므로 정상 동작 */
  return useCallback((node: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && typeof ref === 'object') {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  }, refs);
  /* eslint-enable react-hooks/use-memo, react-hooks/exhaustive-deps */
}
