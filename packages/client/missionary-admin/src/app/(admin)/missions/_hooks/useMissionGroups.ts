import { useQuery } from '@tanstack/react-query';
import { missionGroupApi } from 'apis/missionGroup';
import { queryKeys } from 'lib/queryKeys';

export function useMissionGroups() {
  return useQuery({
    queryKey: queryKeys.missionGroups.list(),
    queryFn: async () => {
      const response = await missionGroupApi.getMissionGroups();
      return response.data;
    },
  });
}
