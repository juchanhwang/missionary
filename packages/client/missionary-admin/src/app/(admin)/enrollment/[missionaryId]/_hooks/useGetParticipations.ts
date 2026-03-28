import { useQuery } from '@tanstack/react-query';
import {
  type GetParticipationsParams,
  type PaginatedParticipationsResponse,
  participationApi,
} from 'apis/participation';
import { queryKeys } from 'lib/queryKeys';

interface UseGetParticipationsOptions {
  params: GetParticipationsParams;
  initialData?: PaginatedParticipationsResponse;
}

export function useGetParticipations({
  params,
  initialData,
}: UseGetParticipationsOptions) {
  return useQuery({
    queryKey: queryKeys.participations.list(params),
    queryFn: async () => {
      const response = await participationApi.getParticipations(params);
      return response.data;
    },
    initialData,
  });
}
