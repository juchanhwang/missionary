import { useSuspenseQuery } from '@tanstack/react-query';
import { missionGroupApi } from 'apis/missionGroup';
import { queryKeys } from 'lib/queryKeys';

export function useSuspenseGetMissionGroup(id: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.missionGroups.detail(id),
    queryFn: async () => {
      const response = await missionGroupApi.getMissionGroup(id);
      return response.data;
    },
  });
}
