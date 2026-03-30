import 'server-only';

import { createServerApi } from './serverInstance';

import type {
  GetParticipationsParams,
  PaginatedParticipationsResponse,
} from './participation';

export async function getServerParticipations(params: GetParticipationsParams) {
  const serverApi = await createServerApi();
  const { data } = await serverApi.get<PaginatedParticipationsResponse>(
    '/participations',
    { params },
  );
  return data;
}
