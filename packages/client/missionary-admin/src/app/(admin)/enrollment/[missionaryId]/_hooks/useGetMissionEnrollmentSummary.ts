import { useQuery } from '@tanstack/react-query';
import { enrollmentApi, type MissionEnrollmentSummary } from 'apis/enrollment';
import { queryKeys } from 'lib/queryKeys';

interface UseGetMissionEnrollmentSummaryOptions {
  missionaryId: string;
  initialData?: MissionEnrollmentSummary;
}

export function useGetMissionEnrollmentSummary({
  missionaryId,
  initialData,
}: UseGetMissionEnrollmentSummaryOptions) {
  return useQuery({
    queryKey: queryKeys.enrollmentSummary.detail(missionaryId),
    queryFn: async () => {
      const response =
        await enrollmentApi.getMissionEnrollmentSummary(missionaryId);
      return response.data;
    },
    initialData,
    enabled: !!missionaryId,
  });
}
