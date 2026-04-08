import { useQuery } from '@tanstack/react-query';
import { missionaryRegionApi } from 'apis/missionaryRegion';
import { queryKeys } from 'lib/queryKeys';

interface UseGetMissionGroupRegionsOptions {
  missionGroupId: string | null;
  enabled?: boolean;
}

/**
 * 팀 생성/수정 모달의 연계지 Select 옵션 소스. fe-plan v1.2 §7-2-2.
 *
 * - `missionGroupId`가 `null`이면 fetch하지 않는다 (R-1 매핑 실패 시 fallback).
 * - 전체 리스트가 필요하므로 limit 생략 → BE가 전체 반환.
 * - 캐시 키는 전역 `queryKeys.missionaryRegions.list`를 재사용하여 regions 페이지와 공유.
 */
export function useGetMissionGroupRegions({
  missionGroupId,
  enabled = true,
}: UseGetMissionGroupRegionsOptions) {
  return useQuery({
    queryKey: queryKeys.missionaryRegions.list({
      missionGroupId: missionGroupId ?? '',
    }),
    queryFn: async () => {
      if (!missionGroupId) return { data: [], total: 0 };
      const response = await missionaryRegionApi.getRegions({ missionGroupId });
      return response.data;
    },
    enabled: enabled && missionGroupId !== null,
    staleTime: 60 * 1000,
  });
}
