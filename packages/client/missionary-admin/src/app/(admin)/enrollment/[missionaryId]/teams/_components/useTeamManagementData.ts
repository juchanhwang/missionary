'use client';

import { useGetParticipations } from '../../_hooks/useGetParticipations';
import { useGetMissionGroupRegions } from '../_hooks/useGetMissionGroupRegions';
import { useGetTeams } from '../_hooks/useGetTeams';

import type { RegionListResponse } from 'apis/missionaryRegion';
import type {
  PaginatedParticipationsResponse,
  Participation,
} from 'apis/participation';
import type { Team } from 'apis/team';

interface UseTeamManagementDataParams {
  missionaryId: string;
  /** 미션 그룹 미선택 시 `null` — 연계지 옵션 패칭은 no-op. */
  missionGroupId: string | null;
  /** RSC prefetch 결과 — 초기 렌더 시 스켈레톤을 건너뛰기 위한 hydrate 데이터. */
  initialTeams?: Team[];
  initialParticipations?: PaginatedParticipationsResponse;
  initialRegions?: RegionListResponse;
}

interface UseTeamManagementDataReturn {
  /** 팀 메타 (R-2 옵션 B). undefined일 수 있다 — `isError` 확인 후 사용. */
  teams: Team[] | undefined;
  /** 참가자 전체 (R-3). data 미수신 시 undefined. */
  participations: Participation[] | undefined;
  /**
   * 미션 그룹 연계지 옵션. 모달 + 필터바에서 공통 사용.
   * 주: 연계지 패칭 실패는 main flow를 막지 않고 빈 배열로 fallback (옵션 데이터 성격).
   */
  regions: RegionListResponse['data'];
  isLoading: boolean;
  isError: boolean;
  /** 팀 + 참가자 두 쿼리를 동시에 refetch. 에러 상태에서 다시 시도 시 사용. */
  handleRetry: () => void;
}

/**
 * 팀 관리 페이지의 핵심 데이터 패칭 훅. fe-plan v1.2 §3-2.
 *
 * 책임:
 * - `useGetTeams`/`useGetParticipations` 두 핵심 쿼리 + `useGetMissionGroupRegions` 옵션 쿼리 결합
 * - 핵심 쿼리의 로딩/에러 상태를 OR로 통합 (regions는 옵션 데이터라 main flow에서 제외)
 * - retry 핸들러 제공 (핵심 두 쿼리 동시 refetch)
 * - RSC prefetch 결과를 `initial*` props로 받아 초기 렌더 즉시 데이터 보유
 */
export function useTeamManagementData({
  missionaryId,
  missionGroupId,
  initialTeams,
  initialParticipations,
  initialRegions,
}: UseTeamManagementDataParams): UseTeamManagementDataReturn {
  const teamsQuery = useGetTeams({ missionaryId, initialData: initialTeams });
  const participationsQuery = useGetParticipations({
    params: { missionaryId },
    initialData: initialParticipations,
  });
  // 모달/필터 옵션 — missionGroupId가 null이면 no-op. 실패해도 main flow는 계속 진행한다.
  const regionsQuery = useGetMissionGroupRegions({
    missionGroupId,
    initialData: initialRegions,
  });

  const handleRetry = () => {
    teamsQuery.refetch();
    participationsQuery.refetch();
  };

  return {
    teams: teamsQuery.data,
    participations: participationsQuery.data?.data,
    regions: regionsQuery.data?.data ?? [],
    isLoading: teamsQuery.isLoading || participationsQuery.isLoading,
    isError: teamsQuery.isError || participationsQuery.isError,
    handleRetry,
  };
}
