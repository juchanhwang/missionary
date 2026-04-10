import 'server-only';

import { createServerApi } from './serverInstance';
import { stripEmpty } from './utils';

import type { Team } from './team';

interface GetServerTeamsParams {
  missionaryId: string;
}

export async function getServerTeams({ missionaryId }: GetServerTeamsParams) {
  const serverApi = await createServerApi();
  const { data } = await serverApi.get<Team[]>('/teams', {
    params: stripEmpty({ missionaryId }),
  });
  return data;
}
