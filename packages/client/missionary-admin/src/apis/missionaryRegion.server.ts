import 'server-only';

import { createServerApi } from './serverInstance';
import { stripEmpty } from './utils';

import type { RegionListResponse } from './missionaryRegion';

export async function getServerMissionGroupRegions(missionGroupId: string) {
  const serverApi = await createServerApi();
  const { data } = await serverApi.get<RegionListResponse>('/regions', {
    params: stripEmpty({ missionGroupId }),
  });
  return data;
}
