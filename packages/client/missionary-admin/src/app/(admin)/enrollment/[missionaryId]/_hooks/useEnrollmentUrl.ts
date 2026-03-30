'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * 등록 상세 페이지의 URL searchParams를 읽고 업데이트하는 훅.
 * 빈 문자열(`''`)을 전달하면 해당 파라미터를 삭제한다.
 */
export function useEnrollmentUrl() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const updateSearchParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  return { searchParams, updateSearchParams };
}
