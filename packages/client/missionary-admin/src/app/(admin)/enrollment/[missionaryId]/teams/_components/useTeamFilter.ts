'use client';

import { useDebounce } from 'hooks/useDebounce';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { TeamFilterState } from './types';

/** 팀명 디바운스 ms. */
const TEAM_QUERY_DEBOUNCE_MS = 200;

interface UseTeamFilterReturn {
  filter: TeamFilterState;
  setFilter: (filter: TeamFilterState) => void;
  /** `filter.query`에 디바운스를 적용한 값. `filterTeams`에 그대로 전달. */
  debouncedQuery: string;
  /** 필터를 초기 상태로 되돌린다. 빈 결과 안내에서 사용. */
  resetFilter: () => void;
}

/**
 * 팀 검색/필터 URL 상태 + 디바운스 훅.
 *
 * 책임:
 * - `query` 입력은 로컬 state(빠른 반응), 디바운스 후 URL `?q=` 동기화
 * - `regionId`는 Select 직접 조작이므로 디바운스 없이 즉시 URL `?region=` 동기화
 * - `setFilter(state)` API 계약을 유지하여 `TeamFilterBar` 코드 변경 최소화
 * - `router.replace` 사용으로 히스토리 폭증 방지
 */
export function useTeamFilter(): UseTeamFilterReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [localQuery, setLocalQuery] = useState(
    () => searchParams.get('q') ?? '',
  );
  const debouncedQuery = useDebounce(localQuery, TEAM_QUERY_DEBOUNCE_MS);
  const regionId = searchParams.get('region') ?? '';

  // debouncedQuery → URL 동기화
  useEffect(() => {
    const currentQ = searchParams.get('q') ?? '';
    if (currentQ === debouncedQuery) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) params.set('q', debouncedQuery);
    else params.delete('q');

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [debouncedQuery, pathname, router, searchParams]);

  const setFilter = (next: TeamFilterState) => {
    setLocalQuery(next.query);

    // regionId 변경은 디바운스 없이 즉시 URL push
    if (next.regionId !== regionId) {
      const params = new URLSearchParams(searchParams.toString());
      if (next.regionId) params.set('region', next.regionId);
      else params.delete('region');

      // debouncedQuery가 아직 반영 안 됐을 수 있으므로 현재 localQuery 사용
      if (next.query) params.set('q', next.query);
      else params.delete('q');

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  };

  const resetFilter = () => {
    setLocalQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('region');

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return {
    filter: { query: localQuery, regionId },
    setFilter,
    debouncedQuery,
    resetFilter,
  };
}
