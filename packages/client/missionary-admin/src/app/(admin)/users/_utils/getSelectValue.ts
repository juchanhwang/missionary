/**
 * DS Select의 onChange 콜백 값에서 단일 문자열을 안전하게 추출한다.
 * Select의 onChange 시그니처: (value?: string | string[] | null) => void
 */
export function getSelectValue<T extends string>(
  value: string | string[] | undefined | null,
  fallback: T | '' = '',
): T | '' {
  if (typeof value === 'string') return value as T;
  return fallback;
}
