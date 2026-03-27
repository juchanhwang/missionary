import 'server-only';

import { createServerApi } from './serverInstance';

import type { AttendanceOption } from './participation';

export async function getServerAttendanceOptions(missionaryId: string) {
  const serverApi = await createServerApi();
  const { data } = await serverApi.get<AttendanceOption[]>(
    `/missionaries/${missionaryId}/attendance-options`,
  );
  return data;
}
