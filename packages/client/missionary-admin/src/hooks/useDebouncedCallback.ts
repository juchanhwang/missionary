import { useEffect, useRef } from 'react';

/**
 * 콜백 함수를 디바운스하는 훅.
 * 마지막 호출 후 delay(ms)가 지나야 실제 콜백이 실행된다.
 *
 * @returns [debouncedFn, cancel] — cancel은 대기 중인 디바운스를 즉시 취소한다.
 */
export function useDebouncedCallback<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => void,
>(callback: T, delay: number): [(...args: Parameters<T>) => void, () => void] {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const debouncedFn = (...args: Parameters<T>) => {
    cancel();
    timerRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  };

  useEffect(() => cancel, []);

  return [debouncedFn, cancel];
}
