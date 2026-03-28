import { useQuery } from '@tanstack/react-query';
import { type Participation, participationApi } from 'apis/participation';
import { queryKeys } from 'lib/queryKeys';

interface UseGetParticipationOptions {
  id: string;
  initialData?: Participation;
}

export function useGetParticipation({
  id,
  initialData,
}: UseGetParticipationOptions) {
  return useQuery({
    queryKey: queryKeys.participations.detail(id),
    queryFn: async () => {
      const response = await participationApi.getParticipation(id);
      return response.data;
    },
    initialData,
    enabled: !!id,
  });
}
