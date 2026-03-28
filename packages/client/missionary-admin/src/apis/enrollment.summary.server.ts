import 'server-only';

import { createServerApi } from './serverInstance';

import type { MissionEnrollmentSummary } from './enrollment';

export async function getServerMissionEnrollmentSummary(missionaryId: string) {
  const serverApi = await createServerApi();
  const { data } = await serverApi.get<MissionEnrollmentSummary>(
    `/participations/enrollment-summary/${missionaryId}`,
  );
  return data;
}
