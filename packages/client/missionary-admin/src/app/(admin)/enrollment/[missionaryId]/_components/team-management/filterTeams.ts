import type { TeamFilterState } from './types';

/**
 * `filterTeams`가 요구하는 최소 인터페이스.
 * 실제 `Team` 타입(W1에서 추가)이 이 인터페이스를 만족하므로 제네릭으로 호환.
 * 이렇게 분리하면 검색/필터 로직이 `Team` 정의 변경에 결합되지 않는다.
 */
export interface FilterableTeam {
  teamName: string;
  missionaryRegionId: string | null;
}

/**
 * 팀 목록을 검색/필터 조건으로 거른다. fe-plan v1.2 §6-3.
 *
 * - 팀명: 대소문자 무시 부분일치
 * - 연계지: `missionaryRegionId` 정확 일치 (빈 문자열은 전체)
 *
 * 검색어 디바운스는 호출자 책임. 본 함수는 순수 함수.
 */
export function filterTeams<T extends FilterableTeam>(
  teams: T[],
  filter: TeamFilterState,
): T[] {
  const normalizedQuery = filter.query.trim().toLowerCase();
  const regionId = filter.regionId;

  if (!normalizedQuery && !regionId) return teams;

  return teams.filter((team) => {
    if (
      normalizedQuery &&
      !team.teamName.toLowerCase().includes(normalizedQuery)
    ) {
      return false;
    }
    if (regionId && team.missionaryRegionId !== regionId) {
      return false;
    }
    return true;
  });
}
