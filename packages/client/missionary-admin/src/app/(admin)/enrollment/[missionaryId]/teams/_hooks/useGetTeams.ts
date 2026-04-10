import { useQuery } from '@tanstack/react-query';
import { type Team, teamApi } from 'apis/team';
import { queryKeys } from 'lib/queryKeys';

interface UseGetTeamsOptions {
  missionaryId: string;
  initialData?: Team[];
}

export function useGetTeams({ missionaryId, initialData }: UseGetTeamsOptions) {
  return useQuery({
    queryKey: queryKeys.teams.list(missionaryId),
    queryFn: async () => {
      const response = await teamApi.getTeams(missionaryId);
      return response.data;
    },
    initialData,
  });
}
