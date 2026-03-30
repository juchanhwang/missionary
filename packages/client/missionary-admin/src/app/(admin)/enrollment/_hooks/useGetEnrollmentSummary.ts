import { useQuery } from '@tanstack/react-query';
import {
  enrollmentApi,
  type GetEnrollmentSummaryResponse,
} from 'apis/enrollment';
import { queryKeys } from 'lib/queryKeys';

interface UseGetEnrollmentSummaryOptions {
  initialData?: GetEnrollmentSummaryResponse;
}

export function useGetEnrollmentSummary({
  initialData,
}: UseGetEnrollmentSummaryOptions = {}) {
  return useQuery({
    queryKey: queryKeys.enrollmentSummary.list(),
    queryFn: async () => {
      const response = await enrollmentApi.getEnrollmentSummary();
      return response.data;
    },
    initialData,
  });
}
