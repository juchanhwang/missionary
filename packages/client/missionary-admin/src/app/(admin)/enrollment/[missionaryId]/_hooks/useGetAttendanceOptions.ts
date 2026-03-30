import { useQuery } from '@tanstack/react-query';
import {
  attendanceOptionApi,
  type AttendanceOption,
} from 'apis/attendanceOption';
import { queryKeys } from 'lib/queryKeys';

interface UseGetAttendanceOptionsOptions {
  missionaryId: string;
  initialData?: AttendanceOption[];
}

export function useGetAttendanceOptions({
  missionaryId,
  initialData,
}: UseGetAttendanceOptionsOptions) {
  return useQuery({
    queryKey: queryKeys.attendanceOptions.list(missionaryId),
    queryFn: async () => {
      const response =
        await attendanceOptionApi.getAttendanceOptions(missionaryId);
      return response.data;
    },
    initialData,
    enabled: !!missionaryId,
  });
}
