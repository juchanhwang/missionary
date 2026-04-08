'use client';

import { useDebounce } from 'hooks/useDebounce';
import { useState } from 'react';

import type { TeamFilterState } from './types';

/** 팀 검색/필터 초기값 — `query`/`regionId` 모두 빈 문자열 = 전체. */
const INITIAL_FILTER: TeamFilterState = {
  query: '',
  regionId: '',
};

/** 팀명 디바운스 ms. fe-plan v1.2 §4-1, §6-3. */
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
 * 팀 검색/필터 로컬 상태 + 디바운스 훅. fe-plan v1.2 §4-1, §6-3.
 *
 * 책임:
 * - filter 상태(`query`, `regionId`) 보관
 * - 팀명 입력에 200ms 디바운스 적용
 * - reset helper 제공
 *
 * 디바운스 ms 상수는 훅 내부 캡슐화 — 호출부가 신경 쓸 필요 없다.
 */
export function useTeamFilter(): UseTeamFilterReturn {
  const [filter, setFilter] = useState<TeamFilterState>(INITIAL_FILTER);
  const debouncedQuery = useDebounce(filter.query, TEAM_QUERY_DEBOUNCE_MS);

  const resetFilter = () => setFilter(INITIAL_FILTER);

  return {
    filter,
    setFilter,
    debouncedQuery,
    resetFilter,
  };
}
