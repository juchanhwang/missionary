import { cache } from 'react';
import 'server-only';

import { createServerApi } from './serverInstance';

import type { MissionEnrollmentSummary } from './enrollment';

export const getServerMissionEnrollmentSummary = cache(
  async (missionaryId: string) => {
    const serverApi = await createServerApi();
    const { data } = await serverApi.get<MissionEnrollmentSummary>(
      `/participations/enrollment-summary/${missionaryId}`,
    );
    return data;
  },
);
