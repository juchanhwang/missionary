import { useQuery } from '@tanstack/react-query';
import { missionaryRegionApi } from 'apis/missionaryRegion';
import { queryKeys } from 'lib/queryKeys';

export function useGetMissionaryRegions(missionaryId: number | null) {
  return useQuery({
    queryKey: queryKeys.missionaryRegions.list(missionaryId!),
    queryFn: async () => {
      const response = await missionaryRegionApi.getRegions(missionaryId!);
      return response.data;
    },
    enabled: missionaryId !== null,
  });
}
