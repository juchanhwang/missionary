import { cache } from 'react';
import 'server-only';

import { createServerApi } from './serverInstance';

import type {
  GetParticipationsParams,
  PaginatedParticipationsResponse,
} from './participation';

export const getServerParticipations = cache(
  async (params: GetParticipationsParams) => {
    const serverApi = await createServerApi();
    const { data } = await serverApi.get<PaginatedParticipationsResponse>(
      '/participations',
      { params },
    );
    return data;
  },
);
