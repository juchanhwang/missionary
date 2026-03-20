import { useQuery } from '@tanstack/react-query';
import { missionaryApi } from 'apis/missionary';
import { queryKeys } from 'lib/queryKeys';

interface UseGetMissionariesOptions {
  missionGroupId?: string;
}

export function useGetMissionaries({
  missionGroupId,
}: UseGetMissionariesOptions = {}) {
  return useQuery({
    queryKey: [...queryKeys.missionaries.list(), { missionGroupId }],
    queryFn: async () => {
      const response = await missionaryApi.getMissionaries();
      return response.data;
    },
    select: (data) =>
      missionGroupId
        ? data.filter((m) => m.missionGroupId === missionGroupId)
        : data,
  });
}
