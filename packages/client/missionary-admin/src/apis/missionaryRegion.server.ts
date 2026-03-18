import { createServerApi } from './serverInstance';

import type { MissionaryRegion } from './missionaryRegion';

export async function getServerMissionaryRegions(missionaryId: number) {
  const serverApi = await createServerApi();
  const { data } = await serverApi.get<MissionaryRegion[]>(
    `/missionaries/${missionaryId}/regions`,
  );
  return data;
}
