import { useQuery } from '@tanstack/react-query';
import { missionGroupApi } from 'apis/missionGroup';
import { queryKeys } from 'lib/queryKeys';

export function useGetMissionGroup(id: string) {
  return useQuery({
    queryKey: queryKeys.missionGroups.detail(id),
    queryFn: async () => {
      const response = await missionGroupApi.getMissionGroup(id);
      return response.data;
    },
    enabled: !!id,
  });
}
